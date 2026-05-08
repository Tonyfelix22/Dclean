"""Scans app Celery tasks."""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_scan(self, scan_id: str):
    """
    Orchestrates a full scan by fanning out scan_source tasks
    for each active source.
    """
    from .models import Scan, ScanTarget
    from sources.models import Source

    try:
        scan = Scan.objects.get(id=scan_id)
        scan.status = Scan.Status.RUNNING
        scan.started_at = timezone.now()
        scan.save(update_fields=["status", "started_at"])

        sources = Source.objects.filter(is_active=True)
        scan.sources_count = sources.count()
        scan.save(update_fields=["sources_count"])

        targets = []
        for source in sources:
            target, _ = ScanTarget.objects.get_or_create(scan=scan, source=source)
            targets.append(target)

        for target in targets:
            scan_source.delay(str(target.id))

        logger.info(f"Scan {scan_id} dispatched {len(targets)} source tasks.")
    except Scan.DoesNotExist:
        logger.error(f"Scan {scan_id} not found.")
    except Exception as exc:
        logger.exception(f"Scan {scan_id} failed: {exc}")
        self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=2)
def scan_source(self, target_id: str):
    """
    Scans a single source for a given ScanTarget.
    This is a stub — real scraping logic lives in services/.
    """
    from .models import ScanTarget, Scan

    try:
        target = ScanTarget.objects.select_related("scan", "source").get(id=target_id)
        target.status = ScanTarget.Status.RUNNING
        target.started_at = timezone.now()
        target.save(update_fields=["status", "started_at"])

        # TODO: call services.scraper.scrape(target.source, target.scan.identity)
        # Stub: mark completed
        target.status = ScanTarget.Status.COMPLETED
        target.completed_at = timezone.now()
        target.save(update_fields=["status", "completed_at"])

        update_scan_progress.delay(str(target.scan_id))
    except ScanTarget.DoesNotExist:
        logger.error(f"ScanTarget {target_id} not found.")
    except Exception as exc:
        logger.exception(f"ScanTarget {target_id} failed: {exc}")
        self.retry(exc=exc, countdown=30)


@shared_task
def update_scan_progress(scan_id: str):
    """Recalculates scan progress and marks it completed if all targets are done."""
    from .models import Scan, ScanTarget

    try:
        scan = Scan.objects.get(id=scan_id)
        total = ScanTarget.objects.filter(scan=scan).count()
        done = ScanTarget.objects.filter(
            scan=scan, status__in=[ScanTarget.Status.COMPLETED, ScanTarget.Status.FAILED]
        ).count()
        scan.progress = int((done / total) * 100) if total else 0

        if done == total:
            scan.status = Scan.Status.COMPLETED
            scan.completed_at = timezone.now()

        scan.save(update_fields=["progress", "status", "completed_at"])
    except Scan.DoesNotExist:
        logger.error(f"Scan {scan_id} not found during progress update.")
