# Type2Lyfe Testing Checklist

## Testing Status: IN PROGRESS
**Date Started:** 2025-10-05  
**Servers Running:**
- Backend: http://localhost:3000 ✅
- Frontend: http://localhost:3001 ✅

---

## 1. Glucose Logging Flows

### 1.1 Voice Input (Google Gemini Live API)
- [ ] Open Glucose Log Modal
- [ ] Switch to Voice tab
- [ ] Click microphone button to start recording
- [ ] Speak glucose reading (e.g., "My glucose is 7.2 before breakfast")
- [ ] Verify transcript appears
- [ ] Verify AI extracts value and context correctly
- [ ] Verify confirmation screen shows correct data
- [ ] Click "Log Reading" to save
- [ ] Verify toast notification appears
- [ ] Verify reading appears in Activity feed
- [ ] Verify reading appears in Dashboard chart
- [ ] Verify source is marked as "voice"

**Expected Behavior:**
- Microphone icon should pulse while listening
- Transcript should appear in real-time
- AI should extract glucose value and context (before_meal, after_meal, etc.)
- Loading spinner during AI processing
- Success toast: "Glucose reading logged successfully! 🩸"

### 1.2 Manual Entry
- [ ] Open Glucose Log Modal
- [ ] Switch to Manual tab
- [ ] Enter glucose value
- [ ] Select context (Before Meal, After Meal, Fasting, etc.)
- [ ] Add optional notes
- [ ] Click "Log Reading"
- [ ] Verify toast notification
- [ ] Verify reading in Activity feed
- [ ] Verify reading in Dashboard chart
- [ ] Verify source is marked as "manual"

**Expected Behavior:**
- Form validation for numeric input
- Context dropdown works
- Notes field optional
- Success toast appears

### 1.3 Photo Analysis (Google Gemini Vision API)
- [ ] Open Glucose Log Modal
- [ ] Switch to Photo tab
- [ ] Upload photo of glucose meter
- [ ] Verify image preview appears
- [ ] Click "Analyze Photo"
- [ ] Verify loading state during analysis
- [ ] Verify AI extracts glucose value
- [ ] Verify confirmation screen
- [ ] Click "Log Reading"
- [ ] Verify toast notification
- [ ] Verify reading in Activity feed
- [ ] Verify source is marked as "photo_analysis"

**Expected Behavior:**
- Image upload works (camera or file)
- Preview shows uploaded image
- Loading spinner during AI analysis
- AI extracts glucose value from meter display
- Success toast appears

---

## 2. Meal Logging Flows

### 2.1 Photo Upload & AI Analysis
- [ ] Open Meal Log Modal
- [ ] Upload photo of meal
- [ ] Verify image preview
- [ ] Click "Analyze Photo"
- [ ] Verify loading state
- [ ] Verify AI identifies food items
- [ ] Verify nutrition estimates (calories, carbs, protein, fat, fiber)
- [ ] Optionally edit meal type
- [ ] Optionally add notes
- [ ] Click "Log Meal"
- [ ] Verify toast notification
- [ ] Verify meal in Activity feed with nutrition display
- [ ] Verify source is marked as "photo_analysis"

**Expected Behavior:**
- Image upload works
- AI identifies multiple food items
- Nutrition breakdown displayed in cards
- Total nutrition calculated
- Success toast: "Meal logged successfully! 🍽️"

### 2.2 Manual Meal Entry
- [ ] Open Meal Log Modal
- [ ] Select meal type (Breakfast, Lunch, Dinner, Snack)
- [ ] Enter meal description
- [ ] Optionally enter nutrition values
- [ ] Add notes
- [ ] Click "Log Meal"
- [ ] Verify toast notification
- [ ] Verify meal in Activity feed

**Expected Behavior:**
- Meal type dropdown works
- Description field required
- Nutrition fields optional
- Success toast appears

---

## 3. Medication Logging

### 3.1 Log Medication Dose
- [ ] Open Medication Log Modal
- [ ] Select medication from dropdown (or enter new)
- [ ] Enter dosage
- [ ] Add optional notes
- [ ] Click "Log Medication"
- [ ] Verify toast notification
- [ ] Verify medication in Activity feed

**Expected Behavior:**
- Dropdown shows user's medications
- Can enter new medication name
- Dosage field works
- Success toast: "Medication logged successfully! 💊"

### 3.2 Manage My Medications
- [ ] Go to Settings page
- [ ] Click "My Medications"
- [ ] Add new medication (name, dosage, frequency, time)
- [ ] Verify medication appears in list
- [ ] Edit existing medication
- [ ] Delete medication (with confirmation)
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify toast notification
- [ ] Verify medication removed from list

**Expected Behavior:**
- Modal opens with medication list
- Add form works
- Edit functionality works
- Delete shows confirmation dialog
- Success/error toasts appear

---

## 4. Weight Logging

### 4.1 Manual Weight Entry
- [ ] Open Weight Log Modal
- [ ] Switch to Manual tab
- [ ] Enter weight value
- [ ] Verify unit matches settings (kg or lbs)
- [ ] Add optional notes
- [ ] Click "Log Weight"
- [ ] Verify toast notification
- [ ] Verify weight in Activity feed
- [ ] Verify weight in Weight Trends chart

**Expected Behavior:**
- Numeric input validation
- Unit display matches settings
- Success toast: "Weight logged successfully! ⚖️"

### 4.2 Voice Input
- [ ] Open Weight Log Modal
- [ ] Switch to Voice tab
- [ ] Speak weight (e.g., "My weight is 75 kilograms")
- [ ] Verify AI extracts value
- [ ] Confirm and log
- [ ] Verify in Activity feed

### 4.3 Photo Analysis
- [ ] Open Weight Log Modal
- [ ] Switch to Photo tab
- [ ] Upload photo of scale
- [ ] Analyze photo
- [ ] Verify AI extracts weight
- [ ] Confirm and log

---

## 5. Blood Pressure Logging

### 5.1 Manual BP Entry
- [ ] Open Blood Pressure Log Modal
- [ ] Switch to Manual tab
- [ ] Enter systolic value
- [ ] Enter diastolic value
- [ ] Enter optional pulse
- [ ] Add optional notes
- [ ] Click "Log Reading"
- [ ] Verify toast notification
- [ ] Verify BP in Activity feed
- [ ] Verify BP in BP Trends chart

**Expected Behavior:**
- Numeric validation for all fields
- Pulse is optional
- Success toast: "Blood pressure logged successfully! 🫀"

### 5.2 Photo Analysis
- [ ] Open Blood Pressure Log Modal
- [ ] Switch to Photo tab
- [ ] Upload photo of BP monitor
- [ ] Analyze photo
- [ ] Verify AI extracts systolic/diastolic
- [ ] Confirm and log

---

## 6. Edit/Delete Functionality

### 6.1 Delete Entry
- [ ] Go to Activity page
- [ ] Hover over any log entry
- [ ] Verify edit/delete buttons appear
- [ ] Click delete button
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" - verify nothing happens
- [ ] Click delete again
- [ ] Click "Delete" - verify entry is deleted
- [ ] Verify success toast
- [ ] Verify entry removed from Activity feed
- [ ] Verify charts update

**Test for all types:**
- [ ] Delete glucose reading
- [ ] Delete meal
- [ ] Delete medication
- [ ] Delete weight reading
- [ ] Delete blood pressure reading

### 6.2 Edit Entry
- [ ] Hover over log entry
- [ ] Click edit button
- [ ] Verify appropriate modal opens
- [ ] Verify modal shows existing data (future enhancement)
- [ ] Make changes
- [ ] Save changes
- [ ] Verify toast notification
- [ ] Verify changes in Activity feed

**Note:** Edit functionality currently opens modal but doesn't pre-populate data. This is a known enhancement for future iteration.

---

## 7. Data Visualization

### 7.1 Glucose Chart
- [ ] Go to Dashboard
- [ ] Verify Glucose Trends chart displays
- [ ] Verify data points are plotted
- [ ] Hover over data point - verify tooltip shows value, time, context
- [ ] Verify high/low reference lines
- [ ] Verify color coding (high=red, low=orange, normal=blue)
- [ ] Test date range filter (7 days, 30 days, 90 days, All Time)
- [ ] Verify chart updates when filter changes

### 7.2 Weight Chart
- [ ] Scroll to Weight Trends section
- [ ] Verify chart displays weight over time
- [ ] Verify trend summary (weight gained/lost)
- [ ] Hover over data point - verify tooltip
- [ ] Test date range filters
- [ ] Verify empty state when no data

### 7.3 Blood Pressure Chart
- [ ] Scroll to BP Trends section
- [ ] Verify dual-line chart (systolic in red, diastolic in blue)
- [ ] Verify reference lines (elevated at 120, high at 140)
- [ ] Verify average BP calculation
- [ ] Verify BP category display (Normal, Elevated, High)
- [ ] Hover over data point - verify tooltip shows both values
- [ ] Test date range filters

### 7.4 Data Export
- [ ] Go to Settings page
- [ ] Verify "Export Data" button appears (only if data exists)
- [ ] Click "Export Data"
- [ ] Verify button shows "Exporting..."
- [ ] Verify CSV file downloads
- [ ] Open CSV file
- [ ] Verify all data types included (glucose, weight, BP, meals, medications)
- [ ] Verify data is organized by type
- [ ] Verify timestamps are formatted correctly
- [ ] Verify filename includes date

---

## 8. UI/UX Features

### 8.1 Toast Notifications
- [ ] Perform any action (log entry, delete, etc.)
- [ ] Verify toast appears in top-right corner
- [ ] Verify correct icon and color for type (success=green, error=red)
- [ ] Verify toast auto-dismisses after 5 seconds
- [ ] Click X to manually close - verify it closes immediately
- [ ] Perform multiple actions - verify toasts stack vertically

### 8.2 Loading States
- [ ] Refresh page
- [ ] Verify fullscreen loading spinner appears
- [ ] Verify message "Loading your health data..."
- [ ] Wait for data to load
- [ ] Verify spinner disappears when loaded
- [ ] Test modal loading states (voice processing, photo analysis)

### 8.3 Confirmation Dialogs
- [ ] Try to delete any entry
- [ ] Verify confirmation dialog appears
- [ ] Verify title, message, and buttons
- [ ] Verify backdrop click cancels
- [ ] Verify "Cancel" button works
- [ ] Verify "Delete" button proceeds with action

### 8.4 Empty States
- [ ] Create new account or clear all data
- [ ] Go to Dashboard - verify empty state with CTA
- [ ] Go to Activity - verify empty state with CTA
- [ ] Click CTA buttons - verify action sheet opens
- [ ] Verify each chart shows empty state when no data

### 8.5 Dark Mode
- [ ] Toggle dark mode in Settings
- [ ] Verify all pages update (Dashboard, Activity, History, Settings)
- [ ] Verify all modals support dark mode
- [ ] Verify all charts support dark mode
- [ ] Verify toasts support dark mode
- [ ] Verify confirmation dialogs support dark mode
- [ ] Toggle back to light mode - verify everything works

---

## 9. Late Entry (History Page)

- [ ] Go to History page
- [ ] Select a past date
- [ ] Select log type (Glucose, Meal, Medication, Weight, BP)
- [ ] Fill in entry details
- [ ] Click "Log Entry"
- [ ] Verify toast notification
- [ ] Verify entry appears in Activity feed with correct date
- [ ] Verify entry appears in appropriate chart

---

## 10. Settings & Preferences

### 10.1 Unit Preferences
- [ ] Go to Settings
- [ ] Change glucose unit (mg/dL ↔ mmol/L)
- [ ] Verify Dashboard chart updates
- [ ] Verify Activity feed updates
- [ ] Change weight unit (kg ↔ lbs)
- [ ] Verify Weight chart updates
- [ ] Verify Activity feed updates

### 10.2 Dark Mode Toggle
- [ ] Toggle dark mode on
- [ ] Verify entire app switches to dark theme
- [ ] Toggle off
- [ ] Verify app switches back to light theme

### 10.3 Logout
- [ ] Click "Logout" button
- [ ] Verify confirmation dialog
- [ ] Confirm logout
- [ ] Verify redirected to login page
- [ ] Verify token removed from localStorage

---

## Test Results Summary

**Total Tests:** TBD  
**Passed:** TBD  
**Failed:** TBD  
**Blocked:** TBD  

### Critical Issues Found:
(To be filled during testing)

### Minor Issues Found:
(To be filled during testing)

### Enhancements Identified:
(To be filled during testing)

---

## Notes

- AI features (voice input, photo analysis) require valid Google Gemini API key
- Testing should be done in both light and dark modes
- Test on different screen sizes (desktop, tablet, mobile)
- Test with different amounts of data (empty, few entries, many entries)
- Test error scenarios (network failures, invalid inputs, etc.)

