# Generated by Django 5.0.1 on 2024-04-16 14:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classroom', '0001_initial'),
        ('student', '0003_remove_class_student_malophoc_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='class_student',
            name='MaGiangVien',
        ),
        migrations.AddField(
            model_name='class_student',
            name='MaLopHoc',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='classroom.classroom'),
        ),
        migrations.AlterField(
            model_name='class_student',
            name='MaSinhVien',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='student.student'),
        ),
    ]