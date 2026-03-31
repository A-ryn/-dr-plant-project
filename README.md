# DR PLANT

## Problem Statement
Farmers and plant enthusiasts, particularly in the Kerala region, often struggle to accurately identify plant diseases and obtain reliable, organic care advice. Traditional methods can be slow or inaccessible, and generic advice often fails to account for local environmental factors like Laterite soil, high humidity, and intense monsoon seasons. This leads to suboptimal plant health and reduced agricultural productivity.

## Project Description
**DR PLANT** is an AI-powered agricultural consultant designed to provide instant, expert-level plant health analysis. By simply uploading a photo, users receive a comprehensive health report tailored to the specific needs of their plants within the Kerala context. 

The application identifies the plant species, detects potential diseases or pests, and generates a detailed care plan. This plan includes:
- **Health Dashboard**: A quick summary of the plant's condition.
- **Organic Remedies**: Step-by-step natural treatments for detected issues.
- **Watering & Climate Guides**: Schedules and environmental optimizations.
- **Organic Feed Recommendations**: Best natural fertilizers for the specific species.
- **Expert Consultation**: Direct answers to specific user concerns provided alongside the analysis.

DR PLANT makes expert agricultural knowledge accessible to everyone, promoting sustainable and organic farming practices.

## Google AI Usage
### Tools / Models Used
- **Model**: `gemini-3-flash-preview` (Gemini 3 Flash)
- **SDK**: `@google/genai`

### How Google AI Was Used
Google AI is the core engine of DR PLANT. It is integrated into the frontend to perform multimodal analysis:
1. **Image Recognition**: The model analyzes the uploaded image to identify the plant species and detect visual symptoms of diseases or nutrient deficiencies.
2. **Contextual Reasoning**: Using a specialized system instruction, the AI acts as a "Kerala-specific Agri-Tech expert," interpreting the image data through the lens of local soil types (Laterite) and climate patterns.
3. **Structured Data Generation**: The AI processes the image and user questions to return a strictly structured JSON response. This allows the application to render a dynamic, interactive dashboard with specific metrics for watering, fertilizers, and remedies.
4. **Natural Language Consultation**: The AI answers specific user questions provided in the "Additional Context" field, integrating these answers directly into the final health report.

## Proof of Google AI Usage
Attach screenshots in a `/proof` folder:

### AI Proof
- [AI Proof](./proof/ai_proof.png) (Screenshot of code integration or API console)

## Screenshots
Add project screenshots:

### Screenshot1
![Main Interface](./screenshots/main_interface.png)

### Screenshot2
![Analysis Report](./screenshots/analysis_report.png)

## Demo Video
Upload your demo video to Google Drive and paste the shareable link here(max 3 minutes). [Watch Demo](https://drive.google.com/your-shareable-link-here)

## Installation Steps
### Clone the repository
```bash
git clone <your-repo-link>
```

### Go to project folder
```bash
cd dr-plant
```

### Install dependencies
```bash
npm install
```

### Run the project
```bash
npm start
```
