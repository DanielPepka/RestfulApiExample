namespace RestfulApiExample.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemovedThings : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.ExampleItems", "ItemIntNullable");
            DropColumn("dbo.ExampleItems", "ItemBoolNullable");
            DropColumn("dbo.ExampleItems", "ItemEnum");
        }
        
        public override void Down()
        {
            AddColumn("dbo.ExampleItems", "ItemEnum", c => c.Int(nullable: false));
            AddColumn("dbo.ExampleItems", "ItemBoolNullable", c => c.Boolean());
            AddColumn("dbo.ExampleItems", "ItemIntNullable", c => c.Int());
        }
    }
}
