const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access your API key as an environment variable (recommended)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

async function parseGlucoseReadingFromImage(image, mimeType) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = 'Parse the glucose reading from this image. The user is in the UK, so if the reading is high (e.g., > 20), it is likely in mg/dL and should be converted to mmol/L. Return a JSON object with "value" (number), "unit" (string), and "context" (string like "fasting", "after_meal", etc.).';
  const imagePart = {
    inlineData: {
      data: image,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse JSON even after cleaning:", error);
    console.error("❌ Raw response text:", text);
    console.error("❌ Cleaned text:", cleanedJsonString);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function analyzeMealPhoto(image, mimeType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2, // Lower temperature for more consistent JSON
    }
  });
  const prompt = `Analyze the food items in this image. Identify each item, estimate its nutritional content (calories, protein, carbs, fat, sugar), and provide a total for the entire meal. The user is in the UK.

IMPORTANT: Return ONLY valid JSON. Ensure every object has proper closing braces.

Required JSON structure:
{
  "items": [
    {"name": "Food Name", "calories": 100, "protein": 10, "carbs": 10, "fat": 5, "sugar": 3}
  ],
  "total": {"calories": 100, "protein": 10, "carbs": 10, "fat": 5, "sugar": 3}
}

Each item MUST have all 6 fields: name, calories, protein, carbs, fat, sugar (in grams).`;
  const imagePart = {
    inlineData: {
      data: image,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  console.log("🔍 Raw AI response:", text);

  // Clean the response text to remove markdown formatting
  let cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  // Try to repair common JSON errors
  // Fix pattern: "sugar": 14.0\n    , (missing closing brace)
  // Should be: "sugar": 14.0\n    },
  cleanedJsonString = cleanedJsonString.replace(/("sugar":\s*\d+\.?\d*)\s*\n\s*,/g, '$1\n    },');
  // Also fix the old "fat" pattern for backward compatibility
  cleanedJsonString = cleanedJsonString.replace(/("fat":\s*\d+\.?\d*)\s*\n\s*,/g, '$1\n    },');

  console.log("🧹 Cleaned JSON string:", cleanedJsonString);

  try {
    const parsed = JSON.parse(cleanedJsonString);
    console.log("✅ Successfully parsed meal analysis:", JSON.stringify(parsed, null, 2));

    // Validate that all required fields are present
    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error("Missing or invalid 'items' array");
    }
    if (!parsed.total || typeof parsed.total !== 'object') {
      throw new Error("Missing or invalid 'total' object");
    }

    // Validate each item has all required fields
    const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar'];
    parsed.items.forEach((item, index) => {
      requiredFields.forEach(field => {
        if (!(field in item)) {
          console.warn(`⚠️ Item ${index} missing field: ${field}, setting to 0`);
          item[field] = field === 'name' ? 'Unknown' : 0;
        }
      });
    });

    // Validate total has all required numeric fields
    const numericFields = ['calories', 'protein', 'carbs', 'fat', 'sugar'];
    numericFields.forEach(field => {
      if (!(field in parsed.total)) {
        console.warn(`⚠️ Total missing field: ${field}, setting to 0`);
        parsed.total[field] = 0;
      }
    });

    console.log("✅ Validated meal analysis:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error("❌ Failed to parse meal photo JSON:", error);
    console.error("❌ Raw response text:", text);
    console.error("❌ Cleaned text:", cleanedJsonString);

    // Try one more repair attempt: add missing closing braces
    try {
      const repairedJson = cleanedJsonString.replace(/(\d+\.?\d*)\s*,\s*$/gm, '$1\n    },');
      const parsed = JSON.parse(repairedJson);
      console.log("✅ JSON repaired successfully!");
      console.log("✅ Repaired meal analysis:", JSON.stringify(parsed, null, 2));

      // Validate repaired JSON as well
      const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar'];
      if (parsed.items && Array.isArray(parsed.items)) {
        parsed.items.forEach((item, index) => {
          requiredFields.forEach(field => {
            if (!(field in item)) {
              console.warn(`⚠️ Item ${index} missing field: ${field}, setting to 0`);
              item[field] = field === 'name' ? 'Unknown' : 0;
            }
          });
        });
      }

      const numericFields = ['calories', 'protein', 'carbs', 'fat', 'sugar'];
      if (parsed.total && typeof parsed.total === 'object') {
        numericFields.forEach(field => {
          if (!(field in parsed.total)) {
            console.warn(`⚠️ Total missing field: ${field}, setting to 0`);
            parsed.total[field] = 0;
          }
        });
      }

      return parsed;
    } catch (repairError) {
      console.error("❌ JSON repair also failed:", repairError);
      throw new Error("Invalid JSON response from AI.");
    }
  }
}

async function parseGlucoseReadingFromText(description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = `Parse the glucose reading from the following text: "${description}". The user is in the UK, so if the reading is high (e.g., > 20), it is likely in mg/dL and should be converted to mmol/L. Also, extract the context of the reading (e.g., before meal, after meal, fasting, random). Return a JSON object with "value" (number) and "context" (string). The context should be one of: "before_meal", "after_meal", "fasting", or "random".`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse glucose text JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function parseWeightFromImage(image, mimeType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = 'Parse the weight reading from this image. The user is in the UK, so the weight is likely in kilograms (kg). Return a JSON object with "value" (number) and "unit" (string).';
  const imagePart = {
    inlineData: {
      data: image,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse weight JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function parseBloodPressureFromImage(image, mimeType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = 'Parse the blood pressure reading from this image. It should include systolic, diastolic, and pulse. Return a JSON object with "systolic" (number), "diastolic" (number), and "pulse" (number).';
  const imagePart = {
    inlineData: {
      data: image,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse blood pressure JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function parseWeightFromText(description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = `Parse the weight from the following text: "${description}". The user is in the UK, so the weight is likely in kilograms (kg). Return a JSON object with "value" (number) and "unit" (string).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse weight text JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function parseBloodPressureFromText(description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = `Parse the blood pressure from the following text: "${description}". It should include systolic, diastolic, and pulse. Return a JSON object with "systolic" (number), "diastolic" (number), and "pulse" (number).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse blood pressure text JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

async function parseMealFromText(description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  const prompt = `Analyze the food items from the following text: "${description}". Identify each item, estimate its nutritional content (calories, protein, carbs, fat), and provide a total for the entire meal. The user is in the UK. Return a JSON object with "items" array (each with "name", "calories", "protein", "carbs", "fat") and "total" object with overall nutritional values.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean the response text to remove markdown formatting
  const cleanedJsonString = text
    .replace(/^```json\s*/, '') // Remove the starting ```json
    .replace(/```$/, '')        // Remove the ending ```
    .trim();                    // Remove any extra whitespace

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("❌ Failed to parse meal text JSON:", error);
    console.error("❌ Raw response text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
}

module.exports = {
  parseGlucoseReadingFromImage,
  analyzeMealPhoto,
  parseGlucoseReadingFromText,
  parseWeightFromImage,
  parseBloodPressureFromImage,
  parseWeightFromText,
  parseBloodPressureFromText,
  parseMealFromText,
};