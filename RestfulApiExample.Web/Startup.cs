using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RestfulApiExample.Web.Startup))]
namespace RestfulApiExample.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
