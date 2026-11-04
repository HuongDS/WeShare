using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WeShare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MergeEventDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EventDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            // Combine the old Date (day) and Time (time of day) columns into one timestamp (UTC).
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""EventDate"" = CASE
                    WHEN ""Date"" IS NOT NULL AND ""Time"" IS NOT NULL
                        THEN ((((""Date"" AT TIME ZONE 'UTC')::date) + ((""Time"" AT TIME ZONE 'UTC')::time)) AT TIME ZONE 'UTC')
                    ELSE COALESCE(""Date"", ""Time"")
                END;");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Events");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Time",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Date"" = ""EventDate"", ""Time"" = ""EventDate"";");

            migrationBuilder.DropColumn(
                name: "EventDate",
                table: "Events");
        }
    }
}
