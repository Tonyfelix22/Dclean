"""Periodic Celery task for running scheduled monitoring scans."""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def run_monitoring_scans():
    """
    Celery Beat periodic task — finds plans due for a scan and triggers them.
    Schedule this in Django admin > Periodic Tasks or via celery beat config.
    """
    from .models import MonitoringPlan
    from scans.tasks import run_scan
    from scans.models import Scan

    now = timezone.now()
    due_plans = MonitoringPlan.objects.filter(
        is_active=True, next_run_at__lte=now
    ).select_related("user")

    for plan in due_plans:
        try:
            identity = plan.user.search_identities.filter(is_primary=True).first()
            if not identity:
                identity = plan.user.search_identities.first()
            if not identity:
                logger.warning(f"No identity for monitoring user {plan.user.email}")
                continue

            scan = Scan.objects.create(
                user=plan.user,
                identity=identity,
                scan_type=Scan.ScanType.MONITORING,
            )
            run_scan.delay(str(scan.id))

            # Advance next_run_at
            from dateutil.relativedelta import relativedelta
            if plan.interval == MonitoringPlan.Interval.DAILY:
                plan.next_run_at = now + relativedelta(days=1)
            elif plan.interval == MonitoringPlan.Interval.WEEKLY:
                plan.next_run_at = now + relativedelta(weeks=1)
            else:
                plan.next_run_at = now + relativedelta(months=1)
            plan.last_run_at = now
            plan.save(update_fields=["last_run_at", "next_run_at"])
        except Exception as exc:
            logger.exception(f"Monitoring scan for {plan.user.email} failed: {exc}")
