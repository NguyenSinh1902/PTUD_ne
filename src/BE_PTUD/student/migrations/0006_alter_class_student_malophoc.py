# Generated by Django 5.0.4 on 2024-04-19 07:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classroom', '0002_alter_classroom_malophoc'),
        ('student', '0005_alter_student_masinhvien'),
    ]

    operations = [
        migrations.AlterField(
            model_name='class_student',
            name='MaLopHoc',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='classroom.classroom'),
        ),
    ]
