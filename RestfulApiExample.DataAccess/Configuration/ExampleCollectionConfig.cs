using RestfulApiExample.Data;
using System.Data.Entity.ModelConfiguration;

namespace RestfulApiExample.DataAccess.Configuration
{
    /// <summary>
    /// ExampleCollectionConfig sets up the properties and foreign keys for the ExampleCollection table
    /// </summary>
    public class ExampleCollectionConfig : EntityTypeConfiguration<ExampleCollection>
    {
        public ExampleCollectionConfig()
        {
            // Setup the primary key
            HasKey(t => t.ExampleCollectionId);

            // And now the other properties
            Property(t => t.Name).HasMaxLength(256);

            // Setup the join table relationship with the ExampleCollectionId as the foreign key.
            HasMany(p => p.ExampleItems).WithRequired(p => p.ExampleCollection).HasForeignKey(p => p.ExampleCollectionId);
        }
    }
}
