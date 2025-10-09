
import { ApiProperty } from '@nestjs/swagger';

export class FoodAnalysisDto {
  @ApiProperty({ example: 'สเต็กปลาแซลมอนกับผักโขม' })
  food_name: string;

  @ApiProperty({ example: 600 })
  calories_per_serving: number;

  @ApiProperty({ example: 40 })
  protein_g: number;

  @ApiProperty({ example: 10 })
  carbs_g: number;

  @ApiProperty({ example: 45 })
  fat_g: number;

  @ApiProperty({ example: 4, required: false })
  fiber_g?: number;

  @ApiProperty({ example: 2, required: false })
  sugar_g?: number;

  @ApiProperty({ example: 400, required: false })
  sodium_mg?: number;

  @ApiProperty({ example: 800, required: false })
  potassium_mg?: number;

  @ApiProperty({ example: 50, required: false })
  calcium_mg?: number;

  @ApiProperty({ example: 2, required: false })
  iron_mg?: number;

  @ApiProperty({ example: 15, required: false })
  vitaminC_mg?: number;

  @ApiProperty({ example: 10, required: false })
  vitaminD_mcg?: number;

  @ApiProperty({
    example: 'ปลาแซลมอนย่าง, ผักโขมผัดเนย, และเลมอน',
    required: false,
  })
  notes?: string;
}
