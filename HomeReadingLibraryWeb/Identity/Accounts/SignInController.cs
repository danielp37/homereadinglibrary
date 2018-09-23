using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Services;
using IdentityModel;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HomeReadingLibraryWeb.Identity.Accounts
{
  [Route("account")]
  public class SignInController : Controller
  {
    private readonly IVolunteerService volunteerService;
    private readonly ILogger<SignInController> logger;
    private readonly IIdentityServerInteractionService interaction;
    private readonly IEventService events;

    public SignInController(IVolunteerService volunteerService,
      ILogger<SignInController> logger,
      IIdentityServerInteractionService interaction,
      IEventService events
    )
    {
      this.volunteerService = volunteerService;
      this.logger = logger;
      this.interaction = interaction;
      this.events = events;
    }

    [HttpGet("signin")]
    public async Task<IActionResult> Index([FromQuery]string returnUrl)
    {
      var vm = new VolunteerByClassViewModel(await volunteerService.GetVolunteersByClassAsync(), returnUrl);

      return View("Index", vm);
    }

    [HttpPost("signin")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index([FromForm]string volunteer, [FromForm]string returnUrl)
    {
      if (ModelState.IsValid)
      {
        // validate username/password against in-memory store
        if (await volunteerService.ValidateCredentials(volunteer, string.Empty, string.Empty))
        {
          var user = await volunteerService.GetUserToVerify(volunteer, string.Empty);
          await events.RaiseAsync(new UserLoginSuccessEvent(user.FullName, user.Id, user.FullName));

          // issue authentication cookie with subject ID and username
          await HttpContext.SignInAsync(user.Id, user.FullName);

          // make sure the returnUrl is still valid, and if so redirect back to authorize endpoint or a local page
          if (interaction.IsValidReturnUrl(returnUrl) || Url.IsLocalUrl(returnUrl))
          {
            return Redirect(returnUrl);
          }

          return Redirect("~/");
        }

        await events.RaiseAsync(new UserLoginFailureEvent(volunteer, "invalid credentials"));

        ModelState.AddModelError("", "Invalid username or password");
      }

      // something went wrong, show form with error
      return await Index(returnUrl);
    }

    [HttpPost("cancel")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cancel([FromForm(Name = "ReturnUrl2")]string returnUrl)
    {
      // the user clicked the "cancel" button
      var context = await interaction.GetAuthorizationContextAsync(returnUrl);
      if (context != null)
      {
        // if the user cancels, send a result back into IdentityServer as if they 
        // denied the consent (even if this client does not require consent).
        // this will send back an access denied OIDC error response to the client.
        await interaction.GrantConsentAsync(context, ConsentResponse.Denied);

        // we can trust model.ReturnUrl since GetAuthorizationContextAsync returned non-null
        return Redirect(returnUrl);
      }
      else
      {
        // since we don't have a valid context, then we just go back to the home page
        return Redirect("~/");
      }
    }

    [HttpPost("adminsignin")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AdminSignin([FromForm]string username, [FromForm]string password, [FromForm]string returnUrl)
    {
      if (ModelState.IsValid)
      {
        // validate username/password against in-memory store
        if (await volunteerService.ValidateCredentials(string.Empty, username, password))
        {
          var user = await volunteerService.GetUserToVerify(string.Empty, username);
          await events.RaiseAsync(new UserLoginSuccessEvent(user.FullName, user.Id, user.FullName));

          // issue authentication cookie with subject ID and username
          await HttpContext.SignInAsync(user.Id, user.FullName);

          // make sure the returnUrl is still valid, and if so redirect back to authorize endpoint or a local page
          if (interaction.IsValidReturnUrl(returnUrl) || Url.IsLocalUrl(returnUrl))
          {
            return Redirect(returnUrl);
          }

          return Redirect("~/");
        }

        await events.RaiseAsync(new UserLoginFailureEvent(username, "invalid credentials"));

        ModelState.AddModelError("", "Invalid username or password");
      }

      // something went wrong, show form with error
      return await Index(returnUrl);
    }

    [HttpGet("logout")]
    public async Task<IActionResult> Logout(string logoutId)
    {
      var logoutViewModel = await BuildLogoutViewModelAsync(logoutId);

      if(!logoutViewModel.ShowLogoutPrompt)
      {
        // if the request for logout was properly authenticated from IdentityServer, then
        // we don't need to show the prompt and can just log the user out directly.
        return await Logout(logoutViewModel);
      }

      return View(logoutViewModel);
    }

    /// <summary>
    /// Handle logout page postback
    /// </summary>
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout(LogoutViewModel logoutViewModel)
    {
      // build a model so the logged out page knows what to display
      var vm = await BuildLoggedOutViewModelAsync(logoutViewModel.LogoutId);

      var user = User;
      if (user?.Identity.IsAuthenticated == true)
      {
        // delete local authentication cookie
        await HttpContext.SignOutAsync();

        // raise the logout event
        await events.RaiseAsync(new UserLogoutSuccessEvent(user.GetSubjectId(), user.GetDisplayName()));
      }

      // check if we need to trigger sign-out at an upstream identity provider
      if (vm.TriggerExternalSignout)
      {
        // build a return URL so the upstream provider will redirect back
        // to us after the user has logged out. this allows us to then
        // complete our single sign-out processing.
        string url = Url.Action("Logout", new { logoutId = vm.LogoutId });

        // this triggers a redirect to the external provider for sign-out
        // hack: try/catch to handle social providers that throw
        return SignOut(new AuthenticationProperties { RedirectUri = url }, vm.ExternalAuthenticationScheme);
      }

      return View("LoggedOut", vm);
    }


    private async Task<LogoutViewModel> BuildLogoutViewModelAsync(string logoutId)
    {
      var vm = new LogoutViewModel { LogoutId = logoutId, ShowLogoutPrompt = false };

      var user = HttpContext.User;
      if (user?.Identity.IsAuthenticated != true)
      {
        // if the user is not authenticated, then just show logged out page
        vm.ShowLogoutPrompt = false;
        return vm;
      }

      var context = await interaction.GetLogoutContextAsync(logoutId);
      if (context?.ShowSignoutPrompt == false)
      {
        // it's safe to automatically sign-out
        vm.ShowLogoutPrompt = false;
        return vm;
      }

      // show the logout prompt. this prevents attacks where the user
      // is automatically signed out by another malicious web page.
      return vm;
    }

    private async Task<LoggedOutViewModel> BuildLoggedOutViewModelAsync(string logoutId)
    {
      // get context information (client name, post logout redirect URI and iframe for federated signout)
      var logout = await interaction.GetLogoutContextAsync(logoutId);

      var vm = new LoggedOutViewModel
      {
        AutomaticRedirectAfterSignOut = true,
        PostLogoutRedirectUri = logout?.PostLogoutRedirectUri,
        ClientName = logout?.ClientId,
        SignOutIframeUrl = logout?.SignOutIFrameUrl,
        LogoutId = logoutId
      };

      var user = User;
      if (user?.Identity.IsAuthenticated == true)
      {
        var idp = user.FindFirst(JwtClaimTypes.IdentityProvider)?.Value;
        if (idp != null && idp != IdentityServer4.IdentityServerConstants.LocalIdentityProvider)
        {
          var providerSupportsSignout = await HttpContext.GetSchemeSupportsSignOutAsync(idp);
          if (providerSupportsSignout)
          {
            if (vm.LogoutId == null)
            {
              // if there's no current logout context, we need to create one
              // this captures necessary info from the current logged in user
              // before we signout and redirect away to the external IdP for signout
              vm.LogoutId = await interaction.CreateLogoutContextAsync();
            }

            vm.ExternalAuthenticationScheme = idp;
          }
        }
      }

      return vm;
    }
  }
}