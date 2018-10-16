namespace RestfulApiExample.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ExampleCollections",
                c => new
                    {
                        ExampleCollectionId = c.Int(nullable: false, identity: true),
                        Name = c.String(maxLength: 256),
                    })
                .PrimaryKey(t => t.ExampleCollectionId);
            
            CreateTable(
                "dbo.ExampleItems",
                c => new
                    {
                        ExampleItemId = c.Int(nullable: false, identity: true),
                        ItemString = c.String(maxLength: 255),
                        ItemInt = c.Int(nullable: false),
                        ItemIntNullable = c.Int(),
                        ItemBool = c.Boolean(nullable: false),
                        ItemBoolNullable = c.Boolean(),
                        ItemEnum = c.Int(nullable: false),
                        ExampleCollectionId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ExampleItemId)
                .ForeignKey("dbo.ExampleCollections", t => t.ExampleCollectionId, cascadeDelete: true)
                .Index(t => t.ExampleCollectionId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.ExampleItems", "ExampleCollectionId", "dbo.ExampleCollections");
            DropIndex("dbo.ExampleItems", new[] { "ExampleCollectionId" });
            DropTable("dbo.ExampleItems");
            DropTable("dbo.ExampleCollections");
        }
    }
}
