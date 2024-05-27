from django.db import models
from student.models import Student
from classroom.models import Classroom
import sympy
import re
# Create your models here.
class ColumnCode(models.Model):
    MaLopHoc = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    TenCotDiem = models.CharField(max_length=50)
    Code = models.CharField(max_length=50, null=True)

    def save(self, *args, **kwargs):
        if not self.Code:
            # Count the current number of ColumnCode for the same MaLopHoc
            count = ColumnCode.objects.filter(MaLopHoc=self.MaLopHoc).count()

            # Generate a unique code based on the count
            self.Code = 'C' + str(count + 1)
        super().save(*args, **kwargs)
        
class Score(models.Model):
    MaSinhVien = models.ForeignKey(Student, on_delete=models.CASCADE)
    MaLopHoc = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    MaCotDiem = models.ForeignKey(ColumnCode, on_delete=models.CASCADE, null=True)  # Cho phép null
    Diem = models.FloatField()
    
    class Meta:
        unique_together = ('MaSinhVien', 'MaLopHoc', 'MaCotDiem')
class FinalScore(models.Model):
    MaSinhVien = models.ForeignKey(Student, on_delete=models.CASCADE)
    MaLopHoc = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    TenCotDiem = models.CharField(max_length=50, default="Tổng kết")
    Diem = models.FloatField()
    
    class Meta:
        unique_together = ('MaSinhVien', 'MaLopHoc')
        
class ScoreFormular(models.Model):
    MaLopHoc = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    Formular = models.CharField(max_length=100, default="")
    is_user_modified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('MaLopHoc', )

    def get_column_codes(self):
        # Get all ColumnCode for this Classroom
        column_codes = self.MaLopHoc.columncode_set.all()
        # Create a mapping from TenCotDiem to Code
        return {cc.TenCotDiem: cc.Code for cc in column_codes}
    
    def replace_column_names_with_codes(self, formula, codes):
        for col, code in codes.items():
            formula = re.sub(r'\b' + re.escape(col) + r'\b', code, formula)
        return formula

    def parse_formula_with_codes(self, formula, codes):
        # Tạo danh sách các ký hiệu từ mã cột
        symbols = {code: sympy.Symbol(code) for code in codes.values()}
        
        try:
            # Phân tích công thức thành biểu thức toán học
            expr = sympy.sympify(formula, locals=symbols)
            return expr
        except sympy.SympifyError:
            raise ValueError("Công thức không hợp lệ")

    def calculate_final_score(self, scores):
        # Get the column codes
        codes = self.get_column_codes()
        # Replace the column names in the formula with codes
        encoded_formula = self.replace_column_names_with_codes(self.Formular, codes)
        # Parse the encoded formula
        expr = self.parse_formula_with_codes(encoded_formula, codes)
        # Evaluate the formula with actual score values
        variables = expr.free_symbols
        score_values = {var: scores.filter(MaCotDiem__Code=str(var)).first().Diem for var in variables}
        final_score = expr.evalf(subs=score_values)
        return final_score
    
    def get_coefficients(self):
        # Get the column codes
        codes = self.get_column_codes()
        # Replace the column names in the formula with codes
        encoded_formula = self.replace_column_names_with_codes(self.Formular, codes)
        # Parse the encoded formula
        expr = self.parse_formula_with_codes(encoded_formula, codes)
        # Get the symbols from the parsed expression
        symbols = {code: sympy.Symbol(code) for code in codes.values()}
        # Calculate and return the coefficients
        return {symbol.name: float(expr.coeff(symbol)) for symbol in symbols.values() if expr.coeff(symbol) != 0}
    
    def process_formula(self, formula, codes):
        encoded_formula = self.replace_column_names_with_codes(formula, codes)
        parsed_expr, symbols = self.parse_formula_with_codes(encoded_formula, codes)
        coefficients = self.get_coefficients(parsed_expr, symbols)
        return parsed_expr, coefficients