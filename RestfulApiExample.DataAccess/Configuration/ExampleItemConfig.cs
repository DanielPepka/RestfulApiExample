using RestfulApiExample.Data;
using System.Data.Entity.ModelConfiguration;

namespace RestfulApiExample.DataAccess.Configuration
{
    /// <summary>
    /// ExampleItemConfig sets up the properties for the ExampleItem table
    /// </summary>
    public class ExampleItemConfig : EntityTypeConfiguration<ExampleItem>
    {
        public ExampleItemConfig()
        {
            // Setup the primary key
            HasKey(t => t.ExampleItemId);
            // And now the other properties
            Property(p => p.ItemString).HasMaxLength(255);
            Property(p => p.ItemInt).IsRequired();
            Property(p => p.ItemBool).IsRequired();

            //NOTE: No need to setup the join table item as it only need to be done on one side of the relationship.
        }
    }
}
