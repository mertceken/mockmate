using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MockMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIdealAnswerHint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdealAnswerHint",
                table: "Answers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdealAnswerHint",
                table: "Answers");
        }
    }
}
