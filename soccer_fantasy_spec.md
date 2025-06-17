# Soccer Fantasy Game - Technical Specification

## 1. Game Overview

### Core Concept
A fantasy soccer game that removes traditional constraints (budget limits, team player limits) to create a more flexible and strategic experience focused on performance prediction and team building.

### Target Audience
- Soccer fans who want more freedom in team selection
- Users seeking simplified fantasy experience without budget management
- Mobile-first users who prefer intuitive interfaces

## 2. Core Game Rules

### 2.1 Team Building
- **No Budget Constraints**: Users can select any players regardless of their real-world value
- **No Team Limits**: Users can select multiple players from the same real team
- **Squad Size**: 11 starting players + 4 substitutes (15 total)
- **Formation Requirements**: Must follow valid soccer formations (4-3-3, 4-4-2, 3-5-2, etc.)

### 2.2 Position Requirements
- **Goalkeeper**: 1 (starting)
- **Defenders**: 3-5 (starting)
- **Midfielders**: 3-5 (starting) 
- **Forwards**: 1-3 (starting)
- **Bench**: 4 players (1 GK, 1 DEF, 1 MID, 1 FWD)

### 2.3 Captain System
- Select 1 captain who receives double points
- Select 1 vice-captain who becomes captain if captain doesn't play

## 3. Scoring System

### 3.1 Basic Scoring
| Action | Points |
|--------|--------|
| Goal (Striker/Midfielder) | +6 |
| Goal (Defender) | +8 |
| Goal (Goalkeeper) | +10 |
| Assist | +4 |
| Clean Sheet (GK/DEF) | +6 |
| 2+ Saves (GK) | +2 |
| Playing 60+ minutes | +2 |
| Playing 30-59 minutes | +1 |

### 3.2 Penalty System
| Action | Points |
|--------|--------|
| Yellow Card | -1 |
| Red Card | -3 |
| Own Goal | -2 |
| Penalty Miss | -2 |

### 3.3 Bonus Scoring
- **Big Match Multiplier**: 1.5x points for designated "big matches" within your chosen league:
  - Premier League: Top 6 vs Top 6 matches, final day matches
  - La Liga: El Clasico, Madrid Derby, final day matches
  - Champions League: Knockout rounds, final
- **Derby Bonus**: +2 points for goals/assists in rivalry matches within your league
- **Performance Bonus**: +3 points for Man of the Match

## 4. Live Game Features

### 4.1 Between-Match Substitutions
- Users get 2 substitution tokens per gameweek
- Can only substitute players between match days, not during live matches
- **Substitution windows:**
  - After Saturday matches end until Sunday matches begin
  - After first match day until second match day (varies by league)
- Substituted players only earn points from matches after the substitution
- Must maintain formation validity
- **Example**: Premier League Saturday matches end at 7pm → substitution window open until Sunday 1:30pm kickoff

### 4.2 Auto-Substitution
- Automatic substitution if starting player doesn't play
- Uses bench players in priority order
- Maintains formation requirements

## 5. User Interface Design

### 5.1 Team Selection Screen
- **Formation View**: Visual soccer pitch layout
- **Player Cards**: Card-based design with player photo, team, position
- **Drag & Drop**: Intuitive player placement
- **Team Filter**: Quick filter by real teams
- **Search Function**: Player name search with autocomplete

### 5.2 Live Match Interface
- **Formation Dashboard**: Real-time view of your team formation
- **Live Scoring**: Players light up when they score points
- **Match Timeline**: Key events affecting your players
- **Substitution Panel**: Easy access to make live changes

### 5.3 Mobile-First Design
- **Gesture Controls**: Swipe to substitute, tap to captain
- **Quick Actions**: One-tap captain selection, formation changes
- **Responsive Layout**: Optimized for phones and tablets
- **Offline Mode**: Cache team data for areas with poor connection

## 6. League System

### 6.1 League Types
- **Public Leagues**: Join random users (8-12 people)
- **Private Leagues**: Create/join with friends using codes
- **Head-to-Head**: Weekly 1v1 matchups
- **Classic**: Season-long points accumulation

### 6.2 Gameweek Structure
- **Deadline**: 1 hour before first match of gameweek
- **Scoring Period**: All matches in the gameweek
- **Results**: Updated within 2 hours of last match

## 7. Technical Requirements

### 7.1 Data Sources
- **Player Database**: Real-time player information, injuries, suspensions
- **Match Data**: Live scores, events, substitutions
- **League Tables**: Current standings and fixtures

### 7.2 Platform Support
- **iOS App**: Native iOS application
- **Android App**: Native Android application  
- **Web App**: Responsive web application
- **API Backend**: RESTful API with real-time updates

### 7.3 Performance Requirements
- **Real-time Updates**: Score updates within 30 seconds of real events
- **Load Time**: App launch under 3 seconds
- **Offline Support**: Core features available without internet

## 8. User Flow

### 8.1 Onboarding
1. Sign up/Login
2. Choose favorite team/league
3. Quick tutorial on team building
4. Join first league
5. Select initial team

### 8.2 Weekly Cycle
1. Review previous gameweek results
2. Check player news/injuries
3. Make team changes
4. Set captain and formation
5. Submit team before deadline
6. Follow live matches
7. Make live substitutions (optional)
8. Review final scores

## 9. Future Considerations

### 9.1 Potential Leagues
- **Launch Leagues**: Premier League, La Liga, Champions League
- **Future Expansion**: Serie A, Bundesliga, Ligue 1
- **Regional**: Local leagues based on user location

### 9.2 Advanced Features (Future Releases)
- Player statistics and trends
- AI-powered team suggestions
- Social features and chat
- Tournament modes

---

# מפרט טכני - משחק פנטזיה כדורגל

## 1. סקירת המשחק

### רעיון מרכזי
משחק פנטזיה כדורגל שמסיר מגבלות מסורתיות (מגבלות תקציב, מגבלות שחקנים לקבוצה) כדי ליצור חוויה גמישה ואסטרטגית יותר המתמקדת בחיזוי ביצועים ובניית קבוצה.

### קהל יעד
- אוהדי כדורגל שרוצים יותר חופש בבחירת קבוצה
- משתמשים המחפשים חוויית פנטזיה פשוטה יותר ללא ניהול תקציב
- משתמשים שמעדיפים ממשק נייד אינטואיטיבי

## 2. חוקי המשחק הבסיסיים

### 2.1 בניית קבוצה
- **ללא מגבלות תקציב**: משתמשים יכולים לבחור כל שחקן ללא קשר לערכו במציאות
- **ללא מגבלות קבוצה**: משתמשים יכולים לבחור מספר שחקנים מאותה קבוצה אמיתית
- **גודל נבחרת**: 11 שחקנים בסיסיים + 4 מחליפים (15 סה"כ)
- **דרישות מערך**: חייב לעקוב אחר מערכים תקפים של כדורגל (4-3-3, 4-4-2, 3-5-2, וכו')

### 2.2 דרישות עמדות
- **שוער**: 1 (בסיסי)
- **מגנים**: 3-5 (בסיסיים)
- **קשרים**: 3-5 (בסיסיים)
- **חלוצים**: 1-3 (בסיסיים)
- **ספסל**: 4 שחקנים (1 שוער, 1 מגן, 1 קשר, 1 חלוץ)

### 2.3 מערכת קפטן
- בחירת קפטן אחד שמקבל נקודות כפולות
- בחירת סגן קפטן שהופך לקפטן אם הקפטן לא משחק

## 3. מערכת ניקוד

### 3.1 ניקוד בסיסי
| פעולה | נקודות |
|--------|--------|
| שער (חלוץ/קשר) | +6 |
| שער (מגן) | +8 |
| שער (שוער) | +10 |
| בישול | +4 |
| שער נקי (שוער/מגן) | +6 |
| 2+ הצלות (שוער) | +2 |
| משחק 60+ דקות | +2 |
| משחק 30-59 דקות | +1 |

### 3.2 מערכת קנסות
| פעולה | נקודות |
|--------|--------|
| כרטיס צהוב | -1 |
| כרטיס אדום | -3 |
| שער עצמי | -2 |
| החמצת פנדל | -2 |

### 3.3 ניקוד בונוס
- **מכפיל משחק גדול**: פי 1.5 נקודות עבור "משחקים גדולים" מיועדים בליגה שבחרת:
  - ליגת העל: משחקים בין 6 הגדולות, משחקי יום אחרון
  - לליגה: אל קלאסיקו, דרבי מדריד, משחקי יום אחרון
  - ליגת האלופות: שלבי נוקאאוט, גמר
- **בונוס דרבי**: +2 נקודות עבור שערים/בישולים במשחקי יריבות בליגה שלך
- **בונוס ביצועים**: +3 נקודות עבור שחקן המשחק

## 4. תכונות משחק חי

### 4.1 החלפות בין משחקים
- משתמשים מקבלים 2 אסימוני החלפה לכל שבוע משחק
- יכולים להחליף שחקנים רק בין ימי משחק, לא במהלך משחקים חיים
- **חלונות החלפה:**
  - אחרי שמשחקי שבת מסתיימים עד שמשחקי ראשון מתחילים
  - אחרי יום משחק ראשון עד יום משחק שני (משתנה לפי ליגה)
- שחקנים מוחלפים זוכים בנקודות רק ממשחקים אחרי ההחלפה
- חייב לשמור על תקפות המערך
- **דוגמה**: משחקי ליגת העל בשבת מסתיימים ב-19:00 → חלון החלפה פתוח עד בעיטת הפתיחה של ראשון ב-13:30

### 4.2 החלפה אוטומטית
- החלפה אוטומטית אם שחקן בסיסי לא משחק
- משתמש בשחקני ספסל לפי סדר עדיפויות
- שומר על דרישות המערך

## 5. עיצוב ממשק משתמש

### 5.1 מסך בחירת קבוצה
- **תצוגת מערך**: פריסה ויזואלית של מגרש כדורגל
- **כרטיסי שחקנים**: עיצוב מבוסס כרטיסים עם תמונת שחקן, קבוצה, עמדה
- **גרירה ושחרור**: מיקום שחקנים אינטואיטיבי
- **מסנן קבוצות**: סינון מהיר לפי קבוצות אמיתיות
- **פונקציית חיפוש**: חיפוש שם שחקן עם השלמה אוטומטית

### 5.2 ממשק משחק חי
- **לוח מערך**: תצוגה בזמן אמת של מערך הקבוצה שלך
- **ניקוד חי**: שחקנים נדלקים כשהם זוכים בנקודות
- **ציר זמן משחק**: אירועים מרכזיים המשפיעים על השחקנים שלך
- **פאנל החלפות**: גישה קלה לביצוע שינויים חיים

### 5.3 עיצוב מובייל-ראשון
- **בקרות מחוות**: החלקה להחלפה, הקשה לקפטן
- **פעולות מהירות**: בחירת קפטן בהקשה אחת, שינויי מערך
- **פריסה רספונסיבית**: מותאם לטלפונים וטאבלטים
- **מצב אופליין**: שמירה במטמון של נתוני קבוצה לאזורים עם חיבור גרוע

## 6. מערכת ליגות

### 6.1 סוגי ליגות
- **ליגות ציבוריות**: הצטרפות למשתמשים אקראיים (8-12 אנשים)
- **ליגות פרטיות**: יצירה/הצטרפות עם חברים באמצעות קודים
- **ראש בראש**: מפגשים שבועיים 1 נגד 1
- **קלאסי**: צבירת נקודות לכל העונה

### 6.2 מבנה שבוע משחק
- **מועד אחרון**: שעה לפני המשחק הראשון של שבוע המשחק
- **תקופת ניקוד**: כל המשחקים בשבוע המשחק
- **תוצאות**: עודכן תוך שעתיים מהמשחק האחרון

## 7. דרישות טכניות

### 7.1 מקורות נתונים
- **מאגר שחקנים**: מידע שחקנים בזמן אמת, פציעות, השעיות
- **נתוני משחקים**: תוצאות חיות, אירועים, החלפות
- **טבלאות ליגה**: דירוג נוכחי ומשחקים

### 7.2 תמיכה בפלטפורמות
- **אפליקציית iOS**: אפליקציה מקורית לiOS
- **אפליקציית Android**: אפליקציה מקורית לAndroid
- **אפליקציית Web**: אפליקציית web רספונסיבית
- **Backend API**: RESTful API עם עדכונים בזמן אמת

### 7.3 דרישות ביצועים
- **עדכונים בזמן אמת**: עדכוני ניקוד תוך 30 שניות מאירועים אמיתיים
- **זמן טעינה**: הפעלת אפליקציה תחת 3 שניות
- **תמיכה אופליין**: תכונות ליבה זמינות ללא אינטרנט

## 8. זרימת משתמש

### 8.1 הכנסה למערכת
1. הרשמה/התחברות
2. בחירת קבוצה/ליגה מועדפת
3. הדרכה מהירה על בניית קבוצה
4. הצטרפות לליגה ראשונה
5. בחירת קבוצה ראשונית

### 8.2 מחזור שבועי
1. סקירת תוצאות שבוע המשחק הקודם
2. בדיקת חדשות שחקנים/פציעות
3. ביצוע שינויים בקבוצה
4. הגדרת קפטן ומערך
5. הגשת קבוצה לפני המועד האחרון
6. מעקב אחר משחקים חיים
7. ביצוע החלפות חיות (אופציונלי)
8. סקירת ניקודים סופיים

## 9. שיקולים עתידיים

### 9.1 ליגות פוטנציאליות
- **ליגות השקה**: ליגת העל האנגלית, לליגה, ליגת האלופות
- **הרחבה עתידית**: סריה A, בונדסליגה, ליג 1
- **אזורי**: ליגות מקומיות לפי מיקום משתמש

### 9.2 תכונות מתקדמות (גרסאות עתידיות)
- סטטיסטיקות ומגמות שחקנים
- הצעות קבוצה מבוססות AI
- תכונות חברתיות וצ'אט
- מצבי טורניר