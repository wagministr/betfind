/**
 * Скрипт для генерации прогнозов на футбольные матчи с использованием API Football и OpenAI
 * 
 * Получает данные о матче, коэффициентах и предсказаниях из API Football,
 * формирует промпт для OpenAI и сохраняет результат в Supabase
 */

import { getOddsForFixture, getPredictionsForFixture, getFixtureById } from '../src/lib/apiFootball';
import { supabase } from '../src/utils/supabase';

// Интерфейс для структурированных ставок
interface ValueBet {
  market: string;
  odds: number;
  confidence: number;
}

// Интерфейс для результата прогноза
interface PredictionResult {
  chain_of_thought: string;
  final_prediction: string;
  value_bets: ValueBet[];
}

/**
 * Основная функция для генерации прогноза на матч
 * @param fixtureId ID матча из API Football
 * @returns ID созданной записи в базе данных или null в случае ошибки
 */
export async function generatePrediction(fixtureId: number): Promise<string | null> {
  try {
    console.log(`Генерация прогноза для матча с ID: ${fixtureId}`);
    
    // Получаем данные о матче
    console.log("Получение информации о матче...");
    const fixtureData = await getFixtureById(fixtureId);
    if (!fixtureData) {
      throw new Error(`Матч с ID ${fixtureId} не найден`);
    }

    // Получаем коэффициенты
    console.log("Получение коэффициентов...");
    const oddsData = await getOddsForFixture(fixtureId);
    
    // Получаем предсказания
    console.log("Получение предсказаний...");
    const predictionsData = await getPredictionsForFixture(fixtureId);

    if (!oddsData || !predictionsData) {
      throw new Error('Не удалось получить все необходимые данные для анализа');
    }

    // Строим промпт для OpenAI
    const prompt = buildPrompt(fixtureData, oddsData, predictionsData);
    
    // Отправляем запрос к OpenAI
    console.log("Отправка запроса к OpenAI...");
    const aiResponse = await callOpenAI(prompt);
    
    // Парсим ответ
    console.log("Обработка ответа от OpenAI...");
    const parsedResponse = parseOpenAIResponse(aiResponse);
    
    // Сохраняем результат в Supabase
    console.log("Сохранение прогноза в базу данных...");
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert({
        fixture_id: fixtureId,
        type: "pre-match",
        chain_of_thought: parsedResponse.chain_of_thought,
        final_prediction: parsedResponse.final_prediction,
        value_bets_json: JSON.stringify(parsedResponse.value_bets),
        model_version: process.env.OPENAI_API_MODEL || "o4-mini",
        generated_at: new Date().toISOString(),
      })
      .select();
    
    if (error) {
      throw new Error(`Ошибка при сохранении в Supabase: ${error.message}`);
    }
    
    console.log(`Прогноз успешно сохранен с ID: ${data[0].id}`);
    return data[0].id;
    
  } catch (error) {
    console.error('Ошибка при генерации прогноза:', error);
    return null;
  }
}

/**
 * Строит промпт для OpenAI на основе данных о матче
 */
function buildPrompt(fixtureData: any, oddsData: any, predictionsData: any): string {
  const homeTeam = fixtureData.teams.home.name;
  const awayTeam = fixtureData.teams.away.name;
  const leagueName = fixtureData.league.name;
  const kickoffTime = new Date(fixtureData.fixture.date).toLocaleString();
  
  // Подготовка данных о коэффициентах для популярных рынков
  let oddsInfo = "Коэффициенты отсутствуют";
  
  if (oddsData && oddsData.length > 0 && oddsData[0].bookmakers && oddsData[0].bookmakers.length > 0) {
    const bookmaker = oddsData[0].bookmakers[0];
    const markets = bookmaker.bets;
    
    oddsInfo = "Коэффициенты:\n";
    
    // Добавляем исходы матча (1X2)
    const homeDrawAway = markets.find((m: any) => m.name === "Match Winner");
    if (homeDrawAway) {
      oddsInfo += "Исход матча:\n";
      homeDrawAway.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
    
    // Добавляем тоталы
    const overUnder = markets.find((m: any) => m.name === "Goals Over/Under");
    if (overUnder) {
      oddsInfo += "\nТоталы:\n";
      overUnder.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
    
    // Добавляем обе забьют
    const btts = markets.find((m: any) => m.name === "Both Teams Score");
    if (btts) {
      oddsInfo += "\nОбе забьют:\n";
      btts.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
  }
  
  // Подготовка данных о предсказаниях
  let predictionsInfo = "Предсказания отсутствуют";
  
  if (predictionsData && predictionsData.predictions) {
    const p = predictionsData.predictions;
    predictionsInfo = `Предсказания API:\n`;
    predictionsInfo += `- Победа ${homeTeam}: ${p.percent.home}%\n`;
    predictionsInfo += `- Ничья: ${p.percent.draw}%\n`;
    predictionsInfo += `- Победа ${awayTeam}: ${p.percent.away}%\n\n`;
    
    if (p.advice) {
      predictionsInfo += `Совет API: ${p.advice}\n`;
    }
    
    if (predictionsData.teams && predictionsData.teams.home && predictionsData.teams.away) {
      const home = predictionsData.teams.home;
      const away = predictionsData.teams.away;
      
      predictionsInfo += `\nФорма ${homeTeam}: ${home.league.form}\n`;
      predictionsInfo += `Форма ${awayTeam}: ${away.league.form}\n\n`;
      
      predictionsInfo += `Среднее количество забитых голов (${homeTeam}): ${home.league.goals.for.average.total}\n`;
      predictionsInfo += `Среднее количество пропущенных голов (${homeTeam}): ${home.league.goals.against.average.total}\n`;
      predictionsInfo += `Среднее количество забитых голов (${awayTeam}): ${away.league.goals.for.average.total}\n`;
      predictionsInfo += `Среднее количество пропущенных голов (${awayTeam}): ${away.league.goals.against.average.total}\n`;
    }
  }
  
  // Формируем полный промпт
  return `
Ты - опытный футбольный аналитик и эксперт по ставкам. Твоя задача - проанализировать предстоящий матч и предоставить глубокий анализ с конкретными рекомендациями по ставкам.

Информация о матче:
- Матч: ${homeTeam} vs ${awayTeam}
- Лига: ${leagueName}
- Дата и время: ${kickoffTime}

${oddsInfo}

${predictionsInfo}

На основе этих данных:

1. Сначала проведи подробный анализ (Chain of Thought), где рассмотри:
   - Текущую форму команд
   - Историю личных встреч
   - Травмы и дисквалификации (если информация есть)
   - Тактический разбор
   - Ключевые факторы, влияющие на исход
   - Специфику лиги и условий матча

2. Затем предоставь короткое итоговое предсказание (Final Prediction) в 2-3 предложения.

3. В конце укажи ТОП-3 ценных ставки (Value Bets) в следующем формате:
   Рынок: [название рынка]
   Коэффициент: [число]
   Уверенность: [число]%

Твой ответ должен быть структурирован так:

CHAIN OF THOUGHT:
[Твой подробный анализ]

FINAL PREDICTION:
[Краткое итоговое предсказание]

VALUE BETS:
Рынок: [название рынка 1]
Коэффициент: [число]
Уверенность: [число]%

Рынок: [название рынка 2]
Коэффициент: [число]
Уверенность: [число]%

Рынок: [название рынка 3]
Коэффициент: [число]
Уверенность: [число]%
`;
}

/**
 * Отправляет запрос к API OpenAI
 * @param prompt Текст запроса
 * @returns Ответ от API
 */
async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_API_MODEL || "o4-mini";
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY не найден в переменных окружения');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Ты - опытный футбольный аналитик и эксперт по ставкам. Отвечай только на русском языке."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        top_p: 1.0,
        max_tokens: 2048,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API OpenAI: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    throw new Error(`Ошибка при обращении к OpenAI: ${error}`);
  }
}

/**
 * Парсит ответ от OpenAI
 * @param response Текст ответа
 * @returns Структурированный результат
 */
function parseOpenAIResponse(response: string): PredictionResult {
  // Разделяем ответ на части по ключевым словам
  const chainRegex = /CHAIN OF THOUGHT:([\s\S]*?)(?=FINAL PREDICTION:|$)/i;
  const finalRegex = /FINAL PREDICTION:([\s\S]*?)(?=VALUE BETS:|$)/i;
  const valueBetsRegex = /VALUE BETS:([\s\S]*?)$/i;
  
  const chainMatch = response.match(chainRegex);
  const finalMatch = response.match(finalRegex);
  const valueBetsMatch = response.match(valueBetsRegex);
  
  // Извлекаем цепочку рассуждений
  const chainOfThought = chainMatch && chainMatch[1] ? chainMatch[1].trim() : '';
  
  // Извлекаем итоговое предсказание
  const finalPrediction = finalMatch && finalMatch[1] ? finalMatch[1].trim() : '';
  
  // Парсим ставки
  const valueBets: ValueBet[] = [];
  
  if (valueBetsMatch && valueBetsMatch[1]) {
    const valueBetsText = valueBetsMatch[1].trim();
    
    // Разбиваем текст на блоки ставок (разделенные пустыми строками)
    const betBlocks = valueBetsText.split(/\n\s*\n/);
    
    for (const block of betBlocks) {
      if (!block.trim()) continue;
      
      const marketMatch = block.match(/Рынок:\s*(.+)/i);
      const oddsMatch = block.match(/Коэффициент:\s*(\d+\.?\d*)/i);
      const confidenceMatch = block.match(/Уверенность:\s*(\d+)%/i);
      
      if (marketMatch && oddsMatch && confidenceMatch) {
        valueBets.push({
          market: marketMatch[1].trim(),
          odds: parseFloat(oddsMatch[1]),
          confidence: parseInt(confidenceMatch[1], 10)
        });
      }
    }
  }
  
  return {
    chain_of_thought: chainOfThought,
    final_prediction: finalPrediction,
    value_bets: valueBets
  };
}

/**
 * Основная функция для ручного запуска скрипта
 */
async function main() {
  try {
    // ID матча для тестирования
    const testFixtureId = 1090754; // Можно заменить на актуальный ID матча
    
    console.log('Запуск генерации прогноза...');
    const result = await generatePrediction(testFixtureId);
    
    if (result) {
      console.log(`Прогноз успешно сгенерирован и сохранен с ID: ${result}`);
      process.exit(0);
    } else {
      console.error('Не удалось сгенерировать прогноз');
      process.exit(1);
    }
  } catch (error) {
    console.error('Ошибка при выполнении скрипта:', error);
    process.exit(1);
  }
}

// Запуск скрипта при прямом вызове
if (require.main === module) {
  main();
}

export default generatePrediction; 