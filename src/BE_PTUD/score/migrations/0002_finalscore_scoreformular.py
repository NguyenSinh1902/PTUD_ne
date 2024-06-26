# Generated by Django 5.0.6 on 2024-05-26 16:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classroom', '0002_alter_classroom_malophoc'),
        ('score', '0001_initial'),
        ('student', '0006_alter_class_student_malophoc'),
    ]

    operations = [
        migrations.CreateModel(
            name='FinalScore',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Diem', models.FloatField()),
                ('MaLopHoc', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='classroom.classroom')),
                ('MaSinhVien', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='student.student')),
            ],
            options={
                'unique_together': {('MaSinhVien', 'MaLopHoc')},
            },
        ),
        migrations.CreateModel(
            name='ScoreFormular',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Formular', models.CharField(max_length=100)),
                ('MaLopHoc', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='classroom.classroom')),
            ],
            options={
                'unique_together': {('MaLopHoc',)},
            },
        ),
    ]
