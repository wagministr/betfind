/**
 * Скрипт для генерации прогнозов для всех доступных предстоящих матчей
 * 
 * Получает список предстоящих матчей, проверяет наличие прогнозов в базе данных
 * и генерирует недостающие прогнозы с использованием OpenAI
 */

import { getUpcomingFixtures } from '../src/lib/apiFootball';
import { supabase } from '../src/utils/supabase';
import generatePrediction from './generatePrediction';

/**
 * Основная функция для генерации прогнозов для всех матчей
 */
export async function generateAllPredictions(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
}> {
  const summary = {
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Получаем все предстоящие матчи из Premier League и La Liga
    console.log('Получение списка предстоящих матчей...');
    const fixtures = await getUpcomingFixtures([39, 140], 3);
    summary.total = fixtures.length;
    
    console.log(`Найдено ${fixtures.length} предстоящих матчей`);
    
    if (fixtures.length === 0) {
      console.log('Нет предстоящих матчей для генерации прогнозов.');
      return summary;
    }
    
    // Получаем существующие прогнозы из базы данных
    console.log('Получение существующих прогнозов из базы данных...');
    const { data: existingPredictions, error } = await supabase
      .from('ai_predictions')
      .select('fixture_id')
      .eq('type', 'pre-match');
    
    if (error) {
      console.error('Ошибка при получении существующих прогнозов:', error);
      throw error;
    }
    
    // Создаем набор ID матчей, для которых уже есть прогнозы
    const existingFixtureIds = new Set(existingPredictions?.map(p => p.fixture_id) || []);
    console.log(`Найдено ${existingFixtureIds.size} существующих прогнозов`);
    
    // Фильтруем матчи, для которых еще нет прогнозов
    const fixturesNeedingPredictions = fixtures.filter(f => !existingFixtureIds.has(f.fixture.id));
    console.log(`Требуется сгенерировать ${fixturesNeedingPredictions.length} новых прогнозов`);
    
    // Генерируем прогнозы с паузами между запросами
    for (let i = 0; i < fixturesNeedingPredictions.length; i++) {
      const fixture = fixturesNeedingPredictions[i];
      const fixtureId = fixture.fixture.id;
      
      console.log(`[${i+1}/${fixturesNeedingPredictions.length}] Генерация прогноза для матча ${fixture.teams.home.name} vs ${fixture.teams.away.name}...`);
      
      try {
        // Генерируем прогноз
        const predictionId = await generatePrediction(fixtureId);
        
        if (predictionId) {
          console.log(`✅ Прогноз успешно сгенерирован с ID: ${predictionId}`);
          summary.generated++;
        } else {
          console.log(`❌ Не удалось сгенерировать прогноз для матча с ID: ${fixtureId}`);
          summary.failed++;
        }
      } catch (err) {
        console.error(`❌ Ошибка при генерации прогноза для матча с ID: ${fixtureId}:`, err);
        summary.failed++;
      }
      
      // Пауза между запросами, чтобы не превысить лимиты API OpenAI
      if (i < fixturesNeedingPredictions.length - 1) {
        console.log('Пауза 5 секунд перед следующим запросом...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Обновляем статистику пропущенных матчей
    summary.skipped = existingFixtureIds.size;
    
    return summary;
    
  } catch (error) {
    console.error('Ошибка при генерации прогнозов:', error);
    throw error;
  }
}

/**
 * Функция для запуска скрипта вручную
 */
async function main() {
  try {
    console.log('Запуск генерации прогнозов для всех матчей...');
    const result = await generateAllPredictions();
    
    console.log('\n--- Результаты генерации прогнозов ---');
    console.log(`Всего матчей: ${result.total}`);
    console.log(`Сгенерировано прогнозов: ${result.generated}`);
    console.log(`Пропущено (уже есть прогнозы): ${result.skipped}`);
    console.log(`Не удалось сгенерировать: ${result.failed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении скрипта:', error);
    process.exit(1);
  }
}

// Запускаем скрипт, если он вызван напрямую
if (require.main === module) {
  main();
} 