# LeadReservation + Lead index cleanup. Production may already have the table (manual/SQL).

import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def _leadreservation_table_exists(schema_editor):
    conn = schema_editor.connection
    table = "leads_leadreservation"
    with conn.cursor() as cursor:
        if conn.vendor == "postgresql":
            cursor.execute(
                """
                SELECT EXISTS (
                    SELECT FROM pg_catalog.pg_tables
                    WHERE schemaname = 'public' AND tablename = %s
                )
                """,
                [table],
            )
            return cursor.fetchone()[0]
        if conn.vendor == "sqlite":
            cursor.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",
                [table],
            )
            return cursor.fetchone() is not None
    return False


def _ensure_leadreservation_indexes(schema_editor):
    """If the table was created outside Django, indexes may be missing."""
    conn = schema_editor.connection
    if conn.vendor not in ("postgresql", "sqlite"):
        return
    stmts = [
        "CREATE INDEX IF NOT EXISTS leads_leadr_provide_ac4c7b_idx ON leads_leadreservation (provider_id, created_at)",
        "CREATE INDEX IF NOT EXISTS leads_leadr_lead_id_1c865e_idx ON leads_leadreservation (lead_id, status)",
        "CREATE INDEX IF NOT EXISTS leads_leadr_status_4325d3_idx ON leads_leadreservation (status, expires_at)",
    ]
    with conn.cursor() as cursor:
        for sql in stmts:
            cursor.execute(sql)


def _create_leadreservation_if_missing(apps, schema_editor):
    if _leadreservation_table_exists(schema_editor):
        _ensure_leadreservation_indexes(schema_editor)
        return

    Lead = apps.get_model("leads", "Lead")
    User = apps.get_model("users", "User")
    DepositRequest = apps.get_model("payments", "DepositRequest")

    class LeadReservationStub(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        credits_required = models.IntegerField(default=1)
        amount_due = models.DecimalField(
            decimal_places=2,
            help_text="Rands due for this reservation",
            max_digits=10,
        )
        status = models.CharField(
            choices=[
                ("pending", "Pending Payment"),
                ("paid", "Paid"),
                ("expired", "Expired"),
                ("cancelled", "Cancelled"),
            ],
            default="pending",
            max_length=20,
        )
        reference_number = models.CharField(
            blank=True,
            help_text="Deposit reference number",
            max_length=100,
        )
        expires_at = models.DateTimeField(help_text="Reservation expiry timestamp")
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        deposit_request = models.ForeignKey(
            DepositRequest,
            blank=True,
            null=True,
            on_delete=django.db.models.deletion.SET_NULL,
            related_name="lead_reservations",
        )
        lead = models.ForeignKey(
            Lead,
            on_delete=django.db.models.deletion.CASCADE,
            related_name="reservations",
        )
        provider = models.ForeignKey(
            User,
            on_delete=django.db.models.deletion.CASCADE,
            related_name="lead_reservations",
        )

        class Meta:
            app_label = "leads"
            db_table = "leads_leadreservation"
            ordering = ["-created_at"]
            indexes = [
                models.Index(
                    fields=["provider", "created_at"],
                    name="leads_leadr_provide_ac4c7b_idx",
                ),
                models.Index(
                    fields=["lead", "status"],
                    name="leads_leadr_lead_id_1c865e_idx",
                ),
                models.Index(
                    fields=["status", "expires_at"],
                    name="leads_leadr_status_4325d3_idx",
                ),
            ]

    schema_editor.create_model(LeadReservationStub)


def _noop_reverse(apps, schema_editor):
    pass


def _drop_lead_index_if_exists(apps, schema_editor):
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP INDEX IF EXISTS leads_lead_provid_6c8f9e_idx")


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("payments", "0006_rename_transactions_lead_id_idx_transaction_lead_id_861912_idx_and_more"),
        ("leads", "0016_lead_providers_routed_at"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(_drop_lead_index_if_exists, _noop_reverse),
            ],
            state_operations=[
                migrations.RemoveIndex(
                    model_name="lead",
                    name="leads_lead_provid_6c8f9e_idx",
                ),
                migrations.AlterField(
                    model_name="lead",
                    name="providers_routed_at",
                    field=models.DateTimeField(
                        blank=True,
                        help_text="When this lead was first routed to providers (assignment + notifications); prevents duplicate sends.",
                        null=True,
                    ),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(_create_leadreservation_if_missing, _noop_reverse),
            ],
            state_operations=[
                migrations.CreateModel(
                    name="LeadReservation",
                    fields=[
                        (
                            "id",
                            models.UUIDField(
                                default=uuid.uuid4,
                                editable=False,
                                primary_key=True,
                                serialize=False,
                            ),
                        ),
                        ("credits_required", models.IntegerField(default=1)),
                        (
                            "amount_due",
                            models.DecimalField(
                                decimal_places=2,
                                help_text="Rands due for this reservation",
                                max_digits=10,
                            ),
                        ),
                        (
                            "status",
                            models.CharField(
                                choices=[
                                    ("pending", "Pending Payment"),
                                    ("paid", "Paid"),
                                    ("expired", "Expired"),
                                    ("cancelled", "Cancelled"),
                                ],
                                default="pending",
                                max_length=20,
                            ),
                        ),
                        (
                            "reference_number",
                            models.CharField(
                                blank=True,
                                help_text="Deposit reference number",
                                max_length=100,
                            ),
                        ),
                        (
                            "expires_at",
                            models.DateTimeField(
                                help_text="Reservation expiry timestamp"
                            ),
                        ),
                        ("created_at", models.DateTimeField(auto_now_add=True)),
                        ("updated_at", models.DateTimeField(auto_now=True)),
                    ],
                    options={
                        "ordering": ["-created_at"],
                    },
                ),
                migrations.AddField(
                    model_name="leadreservation",
                    name="deposit_request",
                    field=models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="lead_reservations",
                        to="payments.depositrequest",
                    ),
                ),
                migrations.AddField(
                    model_name="leadreservation",
                    name="lead",
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reservations",
                        to="leads.lead",
                    ),
                ),
                migrations.AddField(
                    model_name="leadreservation",
                    name="provider",
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lead_reservations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                migrations.AddIndex(
                    model_name="leadreservation",
                    index=models.Index(
                        fields=["provider", "created_at"],
                        name="leads_leadr_provide_ac4c7b_idx",
                    ),
                ),
                migrations.AddIndex(
                    model_name="leadreservation",
                    index=models.Index(
                        fields=["lead", "status"],
                        name="leads_leadr_lead_id_1c865e_idx",
                    ),
                ),
                migrations.AddIndex(
                    model_name="leadreservation",
                    index=models.Index(
                        fields=["status", "expires_at"],
                        name="leads_leadr_status_4325d3_idx",
                    ),
                ),
            ],
        ),
    ]
