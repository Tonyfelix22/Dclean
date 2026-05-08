"""Sources app models — Source, SourceCategory, SourceRemovalTemplate."""
from django.db import models
from core.models import BaseModel


class SourceCategory(BaseModel):
    """Category grouping for data broker sources."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # e.g. emoji or icon name

    class Meta:
        db_table = "source_categories"
        verbose_name = "Source Category"
        verbose_name_plural = "Source Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Source(BaseModel):
    """A website that can be scanned for personal data and from which data can be removed."""

    class RiskLevel(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    name = models.CharField(max_length=200)
    domain = models.CharField(max_length=255, unique=True)
    url = models.URLField()
    category = models.ForeignKey(
        SourceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="sources"
    )
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.MEDIUM)
    is_active = models.BooleanField(default=True)
    is_automated = models.BooleanField(default=False, help_text="Whether removal can be automated.")
    scraping_config = models.JSONField(default=dict, blank=True)
    logo_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    # Stats
    total_scans = models.PositiveIntegerField(default=0)
    avg_removal_days = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "sources"
        verbose_name = "Source"
        verbose_name_plural = "Sources"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.domain})"


class SourceRemovalTemplate(BaseModel):
    """Removal instruction/configuration for a specific source."""

    class Method(models.TextChoices):
        EMAIL = "email", "Email"
        FORM = "form", "Web Form"
        API = "api", "API"
        MANUAL = "manual", "Manual"

    source = models.OneToOneField(Source, on_delete=models.CASCADE, related_name="removal_template")
    method = models.CharField(max_length=20, choices=Method.choices)
    contact_email = models.EmailField(blank=True)
    form_url = models.URLField(blank=True)
    api_endpoint = models.URLField(blank=True)
    template_body = models.TextField(blank=True, help_text="Email template or instructions.")
    instructions = models.TextField(blank=True, help_text="Human-readable removal steps.")
    expected_turnaround_days = models.PositiveIntegerField(default=30)

    class Meta:
        db_table = "source_removal_templates"
        verbose_name = "Source Removal Template"
        verbose_name_plural = "Source Removal Templates"

    def __str__(self):
        return f"Removal template for {self.source.name}"
