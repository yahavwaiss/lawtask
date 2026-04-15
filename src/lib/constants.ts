export const ISRAELI_COURTS = [
  { group: 'עליון', name: 'בית המשפט העליון – ירושלים' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי תל אביב-יפו' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי ירושלים' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי חיפה' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי באר שבע' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי נצרת' },
  { group: 'מחוזי', name: 'בית המשפט המחוזי מרכז (פתח תקווה)' },
  { group: 'שלום', name: 'בית משפט השלום תל אביב' },
  { group: 'שלום', name: 'בית משפט השלום ירושלים' },
  { group: 'שלום', name: 'בית משפט השלום חיפה' },
  { group: 'שלום', name: 'בית משפט השלום באר שבע' },
  { group: 'שלום', name: 'בית משפט השלום ראשון לציון' },
  { group: 'שלום', name: 'בית משפט השלום פתח תקווה' },
  { group: 'שלום', name: 'בית משפט השלום נתניה' },
  { group: 'שלום', name: 'בית משפט השלום רמת גן' },
  { group: 'שלום', name: 'בית משפט השלום חולון' },
  { group: 'שלום', name: 'בית משפט השלום בת ים' },
  { group: 'שלום', name: 'בית משפט השלום רחובות' },
  { group: 'שלום', name: 'בית משפט השלום הרצליה' },
  { group: 'שלום', name: 'בית משפט השלום כפר סבא' },
  { group: 'שלום', name: 'בית משפט השלום אשדוד' },
  { group: 'שלום', name: 'בית משפט השלום אשקלון' },
  { group: 'שלום', name: 'בית משפט השלום נצרת' },
  { group: 'שלום', name: 'בית משפט השלום עכו' },
  { group: 'שלום', name: 'בית משפט השלום טבריה' },
  { group: 'שלום', name: 'בית משפט השלום נהריה' },
  { group: 'שלום', name: 'בית משפט השלום קריית שמונה' },
  { group: 'שלום', name: 'בית משפט השלום בית שמש' },
  { group: 'שלום', name: 'בית משפט השלום רמלה' },
  { group: 'שלום', name: 'בית משפט השלום לוד' },
  { group: 'בית דין לעבודה', name: 'בית הדין האזורי לעבודה תל אביב' },
  { group: 'בית דין לעבודה', name: 'בית הדין האזורי לעבודה ירושלים' },
  { group: 'בית דין לעבודה', name: 'בית הדין האזורי לעבודה חיפה' },
  { group: 'בית דין לעבודה', name: 'בית הדין האזורי לעבודה באר שבע' },
  { group: 'משפחה', name: 'בית המשפט לענייני משפחה תל אביב' },
  { group: 'משפחה', name: 'בית המשפט לענייני משפחה ירושלים' },
  { group: 'משפחה', name: 'בית המשפט לענייני משפחה חיפה' },
]

export const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'דחוף',
  normal: 'רגיל',
  low: 'נמוך',
}

export const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

export const TASK_TYPE_LABEL: Record<string, string> = {
  work: 'עבודה',
  personal: 'אישי',
}

export const CASE_NUMBER_REGEX = /^\d{3,5}-\d{2}-\d{2}$/
