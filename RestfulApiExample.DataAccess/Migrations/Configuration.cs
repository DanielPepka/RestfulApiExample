namespace RestfulApiExample.DataAccess.Migrations
{
    using System.Data.Entity.Migrations;

    /// <summary>
    /// Auto generated file created by running Enable-Migrations from the Package Manager Console in visual studio
    /// </summary>
    internal sealed class Configuration : DbMigrationsConfiguration<RestfulApiExampleContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(RestfulApiExampleContext context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data.
        }
    }
}
