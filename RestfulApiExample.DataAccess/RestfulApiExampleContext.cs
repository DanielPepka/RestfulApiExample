using RestfulApiExample.Data;
using RestfulApiExample.DataAccess.Configuration;
using System.Data.Entity;

namespace RestfulApiExample.DataAccess
{
    /// <summary>
    /// RestfulApiExampleContext is the entity framework context for managing the database for the
    /// RestfulApiExample.Web project, and is also used for the RestfulApiExampleRepository.
    /// </summary>
    public class RestfulApiExampleContext : DbContext
    {
        // Each table in the database needs to be defined as a DbSet
        public DbSet<ExampleCollection> ExampleCollections { get; set; }
        public DbSet<ExampleItem> ExampleItems { get; set; }
        /// <summary>
        /// Uses the variable RestfulApiExample from the app.config or web.config and passes it to the base DbContext for setting up the db connection.
        /// </summary>
        public RestfulApiExampleContext() : base("RestfulApiExample")
        {
        }

        /// <summary>
        /// Takes a connection string or web.config variable name and passes it to the base DbContext for setting up the db connection.
        /// </summary>
        /// <param name="nameOrConnectionString">The name of the connection string variable in the projects web.config or app.config</param>
        public RestfulApiExampleContext(string nameOrConnectionString) : base(nameOrConnectionString)
        {
        }

        /// <summary>
        /// On Model Creating uses the Config classes defined above to determine the properties in the database. 
        /// https://stackoverflow.com/questions/27747599/modelbuilder-configurations-add-and-modelbuilder-entity-on-onmodelcreating
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Configurations.Add(new ExampleItemConfig());
            modelBuilder.Configurations.Add(new ExampleCollectionConfig());
        }
    }
}
