# Generated by Django 5.0.6 on 2024-05-26 18:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0003_columncode_alter_score_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='columncode',
            name='Code',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]