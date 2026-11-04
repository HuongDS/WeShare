using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WeShare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_ReceiveId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_GroupDebts_GroupId",
                table: "GroupDebts");

            migrationBuilder.DropSequence(
                name: "group_hilo_sequence");

            migrationBuilder.DropSequence(
                name: "task_hilo_sequence");

            migrationBuilder.RenameColumn(
                name: "Created_At",
                table: "Transactions",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Created_At",
                table: "Notifications",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Updated_At",
                table: "GroupDebts",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql("UPDATE \"Transactions\" SET \"CreatedAt\" = NOW() WHERE \"CreatedAt\" IS NULL;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Transactions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Transactions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Tasks",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Groups",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Groups",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Groups",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Groups",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Groups",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "GroupMembers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "GroupDebts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            // ---- Data migration: backfill audit columns, keep identity sequences in sync, normalize debts ----
            foreach (var table in new[] { "Users", "Groups", "Events", "Tasks" })
            {
                migrationBuilder.Sql($"UPDATE \"{table}\" SET \"CreatedAt\" = NOW() WHERE \"CreatedAt\" = '0001-01-01 00:00:00+00';");
            }
            migrationBuilder.Sql("UPDATE \"GroupMembers\" SET \"JoinedAt\" = NOW() WHERE \"JoinedAt\" = '0001-01-01 00:00:00+00';");

            // HiLo -> Identity: start identity after the highest existing id
            foreach (var table in new[] { "Groups", "Tasks" })
            {
                migrationBuilder.Sql($"SELECT setval(pg_get_serial_sequence('\"{table}\"', 'Id'), COALESCE((SELECT MAX(\"Id\") FROM \"{table}\"), 0) + 1, false);");
            }

            // GroupDebts: invalid rows, duplicate rows, then net A->B against B->A
            migrationBuilder.Sql("DELETE FROM \"GroupDebts\" WHERE \"Amount\" <= 0 OR \"FromUserId\" = \"ToUserId\";");
            migrationBuilder.Sql(@"UPDATE ""GroupDebts"" g SET ""Amount"" = s.total
                FROM (SELECT MIN(""Id"") AS mid, SUM(""Amount"") AS total, ""GroupId"", ""FromUserId"", ""ToUserId""
                      FROM ""GroupDebts"" GROUP BY ""GroupId"", ""FromUserId"", ""ToUserId"" HAVING COUNT(*) > 1) s
                WHERE g.""Id"" = s.mid;");
            migrationBuilder.Sql(@"DELETE FROM ""GroupDebts"" g USING
                (SELECT MIN(""Id"") AS mid, ""GroupId"", ""FromUserId"", ""ToUserId"" FROM ""GroupDebts"" GROUP BY ""GroupId"", ""FromUserId"", ""ToUserId"") s
                WHERE g.""GroupId"" = s.""GroupId"" AND g.""FromUserId"" = s.""FromUserId"" AND g.""ToUserId"" = s.""ToUserId"" AND g.""Id"" <> s.mid;");
            migrationBuilder.Sql(@"UPDATE ""GroupDebts"" a SET ""Amount"" = a.""Amount"" - b.""Amount""
                FROM ""GroupDebts"" b
                WHERE a.""GroupId"" = b.""GroupId"" AND a.""FromUserId"" = b.""ToUserId"" AND a.""ToUserId"" = b.""FromUserId"" AND a.""Amount"" > b.""Amount"";");
            migrationBuilder.Sql(@"DELETE FROM ""GroupDebts"" a USING ""GroupDebts"" b
                WHERE a.""GroupId"" = b.""GroupId"" AND a.""FromUserId"" = b.""ToUserId"" AND a.""ToUserId"" = b.""FromUserId"" AND a.""Amount"" <= b.""Amount"";");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TransactionSplits_OwedAmount",
                table: "TransactionSplits",
                sql: "\"OwedAmount\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CreatedAt",
                table: "Transactions",
                column: "CreatedAt");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Transactions_Amount",
                table: "Transactions",
                sql: "\"Amount\" > 0");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ReceiveId_IsRead",
                table: "Notifications",
                columns: new[] { "ReceiveId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_GroupDebts_GroupId_FromUserId_ToUserId",
                table: "GroupDebts",
                columns: new[] { "GroupId", "FromUserId", "ToUserId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_GroupDebts_Amount",
                table: "GroupDebts",
                sql: "\"Amount\" > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_GroupDebts_Users",
                table: "GroupDebts",
                sql: "\"FromUserId\" <> \"ToUserId\"");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropCheckConstraint(
                name: "CK_TransactionSplits_OwedAmount",
                table: "TransactionSplits");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CreatedAt",
                table: "Transactions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Transactions_Amount",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_ReceiveId_IsRead",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_GroupDebts_GroupId_FromUserId_ToUserId",
                table: "GroupDebts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_GroupDebts_Amount",
                table: "GroupDebts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_GroupDebts_Users",
                table: "GroupDebts");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Transactions");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Transactions",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "GroupMembers");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "GroupDebts");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Events");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Transactions",
                newName: "Created_At");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Notifications",
                newName: "Created_At");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "GroupDebts",
                newName: "Updated_At");

            migrationBuilder.CreateSequence(
                name: "group_hilo_sequence",
                incrementBy: 10);

            migrationBuilder.CreateSequence(
                name: "task_hilo_sequence",
                incrementBy: 10);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Tasks",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Groups",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Groups",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Groups",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ReceiveId",
                table: "Notifications",
                column: "ReceiveId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDebts_GroupId",
                table: "GroupDebts",
                column: "GroupId");
        }
    }
}
