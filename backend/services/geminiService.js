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
    }
  });
  const prompt = 'Analyze the food items in this image. Identify each item, estimate its nutritional content (calories, protein, carbs, fat), and provide a total for the entire meal. The user is in the UK. Return a JSON object with "items" array (each with "name", "calories", "protein", "carbs", "fat") and "total" object with overall nutritional values.';
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
    console.error("❌ Failed to parse meal photo JSON:", error);
    console.error("❌ Raw response text:", text);
    console.error("❌ Cleaned text:", cleanedJsonString);
    throw new Error("Invalid JSON response from AI.");
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