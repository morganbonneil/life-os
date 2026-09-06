import { DEFAULT_PLAN, RECOV_DEFAULT } from "./constants";
import { addDays, ing, iso, monday, parseIso } from "./utils";

// Starter deck for the language flashcards tool — a handful of Spanish
// basics so the feature isn't empty on first use. Every card starts in
// box 1, due today, so it shows up in the very first study session.
export function buildFlashcards() {
  const tk = iso(new Date());
  return [
    { id: "fc1", deckId: "fd1", front: "hola", back: "hello", box: 1, due: tk },
    { id: "fc2", deckId: "fd1", front: "gracias", back: "thank you", box: 1, due: tk },
    { id: "fc3", deckId: "fd1", front: "por favor", back: "please", box: 1, due: tk },
    { id: "fc4", deckId: "fd1", front: "¿cómo estás?", back: "how are you?", box: 1, due: tk },
    { id: "fc5", deckId: "fd1", front: "el entrenamiento", back: "the training", box: 1, due: tk },
    { id: "fc6", deckId: "fd1", front: "el descanso", back: "the rest", box: 1, due: tk },
  ];
}

export function buildMeals() {
  return [
    { id: "meal01", name: "Banane-Miel Express", slot: "Pre-training", time: "08:00", day: "training", kcal: 249, p: 6, c: 55, f: 2, ing: [ing("Banane", 101, "g"), ing("Pain blanc", 51, "g"), ing("Miel", 8, "g")] },
    { id: "meal02", name: "Compote & Tartine Confiture", slot: "Pre-training", time: "08:00", day: "training", kcal: 251, p: 4, c: 52, f: 3, ing: [ing("Compote sans sucre ajouté", 136, "g"), ing("Pain de mie", 50, "g"), ing("Confiture", 14, "g")] },
    { id: "meal03", name: "Jus d'Orange & Biscottes", slot: "Pre-training", time: "08:00", day: "training", kcal: 249, p: 5, c: 52, f: 3, ing: [ing("Jus d'orange", 217, "g"), ing("Biscottes", 30, "g"), ing("Confiture", 11, "g")] },
    { id: "meal04", name: "Dattes du Sprinteur", slot: "Pre-training", time: "08:00", day: "training", kcal: 250, p: 5, c: 55, f: 2, ing: [ing("Dattes", 40, "g"), ing("Pain blanc", 52, "g")] },
    { id: "meal05", name: "Pain Blanc & Raisins Secs", slot: "Pre-training", time: "08:00", day: "training", kcal: 252, p: 6, c: 54, f: 2, ing: [ing("Raisins secs", 31, "g"), ing("Pain blanc", 60, "g")] },
    { id: "meal06", name: "Mangue & Tartine", slot: "Pre-training", time: "08:00", day: "training", kcal: 250, p: 6, c: 54, f: 2, ing: [ing("Mangue", 191, "g"), ing("Pain blanc", 51, "g")] },
    { id: "meal07", name: "Biscottes Miel-Banane", slot: "Pre-training", time: "08:00", day: "training", kcal: 252, p: 4, c: 57, f: 3, ing: [ing("Banane", 121, "g"), ing("Biscottes", 27, "g"), ing("Miel", 11, "g")] },
    { id: "meal08", name: "Pomme & Pain Miel", slot: "Pre-training", time: "08:00", day: "training", kcal: 251, p: 6, c: 54, f: 2, ing: [ing("Pomme", 177, "g"), ing("Pain blanc", 60, "g")] },
    { id: "meal09", name: "Orange Pressée & Tartine", slot: "Pre-training", time: "08:00", day: "training", kcal: 250, p: 7, c: 54, f: 2, ing: [ing("Orange", 228, "g"), ing("Pain blanc", 54, "g")] },
    { id: "meal10", name: "Compote-Biscotte Miel", slot: "Pre-training", time: "08:00", day: "training", kcal: 251, p: 4, c: 53, f: 3, ing: [ing("Compote sans sucre ajouté", 139, "g"), ing("Biscottes", 33, "g"), ing("Miel", 13, "g")] },
    { id: "meal11", name: "Le Classique Riz-Poulet", slot: "Post-training", time: "10:45", day: "training", kcal: 787, p: 45, c: 105, f: 20, ing: [ing("Riz blanc (cru)", 98, "g"), ing("Blanc de poulet (cuit)", 109, "g"), ing("Huile d'olive", 15, "g"), ing("Légumes verts", 150, "g"), ing("Banane", 100, "g")] },
    { id: "meal12", name: "Pâtes Bolognaise du Sprinteur", slot: "Post-training", time: "10:45", day: "training", kcal: 791, p: 45, c: 105, f: 20, ing: [ing("Pâtes (crues)", 119, "g"), ing("Bœuf haché 5% (cuit)", 111, "g"), ing("Huile d'olive", 9, "g"), ing("Légumes verts", 150, "g"), ing("Parmesan", 10, "g"), ing("Pomme", 100, "g")] },
    { id: "meal13", name: "Patate Douce & Dinde Rôtie", slot: "Post-training", time: "10:45", day: "training", kcal: 768, p: 45, c: 105, f: 20, ing: [ing("Patate douce (crue)", 441, "g"), ing("Escalope de dinde (cuite)", 112, "g"), ing("Avocat", 120, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal14", name: "Riz Thon-Œufs Power", slot: "Post-training", time: "10:45", day: "training", kcal: 789, p: 45, c: 105, f: 20, ing: [ing("Riz blanc (cru)", 127, "g"), ing("Thon au naturel (égoutté)", 79, "g"), ing("Huile d'olive", 8, "g"), ing("Œufs", 2, "pc"), ing("Légumes verts", 150, "g")] },
    { id: "meal15", name: "Riz-Jambon Croquant aux Noix", slot: "Post-training", time: "10:45", day: "training", kcal: 785, p: 45, c: 105, f: 20, ing: [ing("Riz blanc (cru)", 122, "g"), ing("Jambon blanc", 168, "g"), ing("Noix", 21, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal16", name: "Quinoa du Recordman", slot: "Post-training", time: "10:45", day: "training", kcal: 787, p: 45, c: 105, f: 20, ing: [ing("Quinoa (cru)", 136, "g"), ing("Blanc de poulet (cuit)", 71, "g"), ing("Huile d'olive", 9, "g"), ing("Légumes verts", 150, "g"), ing("Orange", 100, "g")] },
    { id: "meal17", name: "Pommes de Terre & Steak Récup'", slot: "Post-training", time: "10:45", day: "training", kcal: 795, p: 45, c: 105, f: 20, ing: [ing("Pommes de terre (crues)", 582, "g"), ing("Steak 5% (cuit)", 145, "g"), ing("Huile d'olive", 12, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal18", name: "Pâtes aux Crevettes Piste", slot: "Post-training", time: "10:45", day: "training", kcal: 794, p: 45, c: 105, f: 20, ing: [ing("Pâtes (crues)", 138, "g"), ing("Crevettes (cuites)", 101, "g"), ing("Huile d'olive", 14, "g"), ing("Parmesan", 10, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal19", name: "Riz au Saumon Explosif", slot: "Post-training", time: "10:45", day: "training", kcal: 835, p: 45, c: 105, f: 23, ing: [ing("Riz blanc (cru)", 128, "g"), ing("Saumon (cru)", 164, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal20", name: "Semoule Poulet-Pois Chiches", slot: "Post-training", time: "10:45", day: "training", kcal: 802, p: 45, c: 105, f: 20, ing: [ing("Semoule (crue)", 115, "g"), ing("Blanc de poulet (cuit)", 72, "g"), ing("Huile d'olive", 14, "g"), ing("Pois chiches (cuits)", 60, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal21", name: "Cabillaud-Pommes de Terre Vapeur", slot: "Lunch", time: "13:30", day: "training", kcal: 725, p: 40, c: 95, f: 20, ing: [ing("Pommes de terre (crues)", 489, "g"), ing("Cabillaud (cuit)", 114, "g"), ing("Huile d'olive", 14, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 125, "g")] },
    { id: "meal22", name: "Pâtes Carbonara du Sprinteur", slot: "Lunch", time: "13:30", day: "training", kcal: 730, p: 40, c: 95, f: 20, ing: [ing("Pâtes (crues)", 118, "g"), ing("Œufs", 1, "pc"), ing("Huile d'olive", 5, "g"), ing("Parmesan", 15, "g"), ing("Légumes verts", 150, "g"), ing("Fromage blanc 3%", 100, "g")] },
    { id: "meal23", name: "Riz-Poulet Ratatouille", slot: "Lunch", time: "13:30", day: "training", kcal: 736, p: 40, c: 95, f: 20, ing: [ing("Riz blanc (cru)", 108, "g"), ing("Blanc de poulet (cuit)", 62, "g"), ing("Huile d'olive", 11, "g"), ing("Légumes verts", 200, "g"), ing("Yaourt grec", 100, "g")] },
    { id: "meal24", name: "Sandwich Costaud Jambon-Fromage", slot: "Lunch", time: "13:30", day: "training", kcal: 723, p: 40, c: 95, f: 20, ing: [ing("Pain blanc", 156, "g"), ing("Jambon blanc", 67, "g"), ing("Fromage à pâte dure (emmental...)", 42, "g"), ing("Légumes verts", 100, "g"), ing("Pomme", 100, "g")] },
    { id: "meal25", name: "Dinde-Pommes de Terre Maison", slot: "Lunch", time: "13:30", day: "training", kcal: 729, p: 40, c: 95, f: 20, ing: [ing("Pommes de terre (crues)", 494, "g"), ing("Escalope de dinde (cuite)", 46, "g"), ing("Huile d'olive", 18, "g"), ing("Légumes verts", 150, "g"), ing("Skyr", 125, "g")] },
    { id: "meal26", name: "Riz Complet au Thon", slot: "Lunch", time: "13:30", day: "training", kcal: 734, p: 40, c: 95, f: 20, ing: [ing("Riz complet (cru)", 117, "g"), ing("Thon au naturel (égoutté)", 95, "g"), ing("Huile d'olive", 12, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 100, "g")] },
    { id: "meal27", name: "Pâtes Bœuf-Parmesan", slot: "Lunch", time: "13:30", day: "training", kcal: 730, p: 41, c: 95, f: 20, ing: [ing("Pâtes (crues)", 122, "g"), ing("Parmesan", 64, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal28", name: "Quinoa Poulet-Avocat", slot: "Lunch", time: "13:30", day: "training", kcal: 720, p: 40, c: 95, f: 20, ing: [ing("Quinoa (cru)", 130, "g"), ing("Blanc de poulet (cuit)", 56, "g"), ing("Avocat", 65, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal29", name: "Pommes de Terre & Œufs Fermier", slot: "Lunch", time: "13:30", day: "training", kcal: 721, p: 40, c: 95, f: 20, ing: [ing("Pommes de terre (crues)", 495, "g"), ing("Œufs", 3, "pc"), ing("Huile d'olive", 1, "g"), ing("Légumes verts", 150, "g"), ing("Fromage blanc 3%", 80, "g")] },
    { id: "meal30", name: "Riz aux Crevettes Sautées", slot: "Lunch", time: "13:30", day: "training", kcal: 732, p: 40, c: 95, f: 20, ing: [ing("Riz blanc (cru)", 108, "g"), ing("Crevettes (cuites)", 123, "g"), ing("Huile d'olive", 14, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 100, "g")] },
    { id: "meal31", name: "Saumon-Riz Complet Récupération", slot: "Dinner", time: "20:00", day: "training", kcal: 929, p: 50, c: 108, f: 30, ing: [ing("Riz complet (cru)", 131, "g"), ing("Saumon (cru)", 142, "g"), ing("Avocat", 42, "g"), ing("Légumes verts", 150, "g"), ing("Fromage blanc 3%", 100, "g")] },
    { id: "meal32", name: "Steak & Patate Douce Rôtie", slot: "Dinner", time: "20:00", day: "training", kcal: 899, p: 50, c: 108, f: 30, ing: [ing("Patate douce (crue)", 488, "g"), ing("Steak 5% (cuit)", 164, "g"), ing("Noix", 32, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal33", name: "Lentilles-Poulet Mijotées", slot: "Dinner", time: "20:00", day: "training", kcal: 930, p: 55, c: 108, f: 31, ing: [ing("Lentilles (crues)", 163, "g"), ing("Huile d'olive", 28, "g"), ing("Légumes verts", 150, "g"), ing("Skyr", 100, "g")] },
    { id: "meal34", name: "Pois Chiches-Feta Méditerranéen", slot: "Dinner", time: "20:00", day: "training", kcal: 900, p: 50, c: 108, f: 30, ing: [ing("Pois chiches (cuits)", 363, "g"), ing("Blanc de poulet (cuit)", 22, "g"), ing("Huile d'olive", 9, "g"), ing("Feta", 50, "g"), ing("Légumes verts", 200, "g")] },
    { id: "meal35", name: "Maquereau-Riz Oméga-3", slot: "Dinner", time: "20:00", day: "training", kcal: 919, p: 50, c: 108, f: 30, ing: [ing("Riz blanc (cru)", 131, "g"), ing("Maquereau", 198, "g"), ing("Avocat", 6, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal36", name: "Dinde-Quinoa du Soir", slot: "Dinner", time: "20:00", day: "training", kcal: 914, p: 50, c: 108, f: 30, ing: [ing("Quinoa (cru)", 152, "g"), ing("Escalope de dinde (cuite)", 77, "g"), ing("Huile d'olive", 16, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 100, "g")] },
    { id: "meal37", name: "Sardines-Pommes de Terre", slot: "Dinner", time: "20:00", day: "training", kcal: 918, p: 50, c: 108, f: 30, ing: [ing("Pommes de terre (crues)", 600, "g"), ing("Sardines", 140, "g"), ing("Huile d'olive", 14, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal38", name: "Bœuf-Riz Complet Force", slot: "Dinner", time: "20:00", day: "training", kcal: 908, p: 50, c: 108, f: 30, ing: [ing("Riz complet (cru)", 127, "g"), ing("Bœuf haché 5% (cuit)", 167, "g"), ing("Avocat", 120, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal39", name: "Cabillaud-Patate Douce Douceur", slot: "Dinner", time: "20:00", day: "training", kcal: 904, p: 50, c: 108, f: 30, ing: [ing("Patate douce (crue)", 494, "g"), ing("Cabillaud (cuit)", 163, "g"), ing("Huile d'olive", 27, "g"), ing("Légumes verts", 150, "g"), ing("Fromage blanc 3%", 80, "g")] },
    { id: "meal40", name: "Crevettes-Riz du Vainqueur", slot: "Dinner", time: "20:00", day: "training", kcal: 915, p: 50, c: 108, f: 30, ing: [ing("Riz blanc (cru)", 125, "g"), ing("Crevettes (cuites)", 165, "g"), ing("Huile d'olive", 24, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 100, "g")] },
    { id: "meal41", name: "Porridge Protéiné Beurre de Cacahuète", slot: "Breakfast", time: "09:00", day: "rest", kcal: 452, p: 25, c: 55, f: 15, ing: [ing("Flocons d'avoine", 52, "g"), ing("Skyr", 88, "g"), ing("Beurre de cacahuète", 19, "g"), ing("Lait demi-écrémé", 100, "g"), ing("Banane", 50, "g")] },
    { id: "meal42", name: "Pain Complet & Œufs Brouillés", slot: "Breakfast", time: "09:00", day: "rest", kcal: 509, p: 28, c: 55, f: 18, ing: [ing("Pain complet", 131, "g"), ing("Œufs", 3, "pc")] },
    { id: "meal43", name: "Bol Muesli-Yaourt Grec", slot: "Breakfast", time: "09:00", day: "rest", kcal: 462, p: 25, c: 55, f: 15, ing: [ing("Muesli sans sucre ajouté", 70, "g"), ing("Yaourt grec", 165, "g"), ing("Amandes", 3, "g"), ing("Lait demi-écrémé", 80, "g")] },
    { id: "meal44", name: "Tartines Jambon-Fromage", slot: "Breakfast", time: "09:00", day: "rest", kcal: 462, p: 25, c: 55, f: 15, ing: [ing("Pain complet", 99, "g"), ing("Jambon blanc", 37, "g"), ing("Fromage à pâte dure (emmental...)", 32, "g"), ing("Pomme", 100, "g")] },
    { id: "meal45", name: "Avoine Skyr-Amandes", slot: "Breakfast", time: "09:00", day: "rest", kcal: 454, p: 25, c: 55, f: 15, ing: [ing("Flocons d'avoine", 57, "g"), ing("Skyr", 114, "g"), ing("Amandes", 21, "g"), ing("Banane", 50, "g")] },
    { id: "meal46", name: "Poulet-Pommes de Terre Léger", slot: "Lunch", time: "13:30", day: "rest", kcal: 706, p: 40, c: 85, f: 22, ing: [ing("Pommes de terre (crues)", 437, "g"), ing("Blanc de poulet (cuit)", 80, "g"), ing("Huile d'olive", 15, "g"), ing("Légumes verts", 150, "g"), ing("Yaourt nature", 100, "g")] },
    { id: "meal47", name: "Pâtes aux Œufs Repos", slot: "Lunch", time: "13:30", day: "rest", kcal: 702, p: 40, c: 85, f: 22, ing: [ing("Pâtes (crues)", 108, "g"), ing("Œufs", 3, "pc"), ing("Huile d'olive", 1, "g"), ing("Parmesan", 15, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal48", name: "Riz-Dinde du Dimanche", slot: "Lunch", time: "13:30", day: "rest", kcal: 716, p: 40, c: 85, f: 22, ing: [ing("Riz blanc (cru)", 102, "g"), ing("Escalope de dinde (cuite)", 103, "g"), ing("Huile d'olive", 20, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal49", name: "Sandwich Jambon-Fromage Repos", slot: "Lunch", time: "13:30", day: "rest", kcal: 708, p: 40, c: 85, f: 22, ing: [ing("Pain blanc", 164, "g"), ing("Jambon blanc", 52, "g"), ing("Fromage à pâte dure (emmental...)", 50, "g"), ing("Légumes verts", 100, "g")] },
    { id: "meal50", name: "Quinoa Thon-Avocat", slot: "Lunch", time: "13:30", day: "rest", kcal: 689, p: 40, c: 85, f: 22, ing: [ing("Quinoa (cru)", 110, "g"), ing("Thon au naturel (égoutté)", 76, "g"), ing("Avocat", 95, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal51", name: "Tartine Yaourt Grec-Amandes", slot: "Snack", time: "17:00", day: "rest", kcal: 394, p: 20, c: 50, f: 12, ing: [ing("Pain complet", 85, "g"), ing("Yaourt grec", 121, "g"), ing("Amandes", 5, "g"), ing("Banane", 40, "g")] },
    { id: "meal52", name: "Tartine Fromage-Pomme", slot: "Snack", time: "17:00", day: "rest", kcal: 453, p: 21, c: 51, f: 18, ing: [ing("Pain complet", 91, "g"), ing("Fromage à pâte dure (emmental...)", 46, "g"), ing("Pomme", 100, "g")] },
    { id: "meal53", name: "Skyr-Granola Croquant", slot: "Snack", time: "17:00", day: "rest", kcal: 400, p: 20, c: 50, f: 13, ing: [ing("Granola maison", 62, "g"), ing("Skyr", 126, "g"), ing("Pomme", 80, "g")] },
    { id: "meal54", name: "Fromage Blanc Miel-Noix", slot: "Snack", time: "17:00", day: "rest", kcal: 378, p: 20, c: 50, f: 12, ing: [ing("Miel", 48, "g"), ing("Fromage blanc 3%", 223, "g"), ing("Noix", 13, "g")] },
    { id: "meal55", name: "Tartine Beurre de Cacahuète-Banane", slot: "Snack", time: "17:00", day: "rest", kcal: 386, p: 20, c: 50, f: 12, ing: [ing("Pain complet", 72, "g"), ing("Skyr", 77, "g"), ing("Beurre de cacahuète", 18, "g"), ing("Banane", 60, "g")] },
    { id: "meal56", name: "Saumon-Riz Complet du Soir", slot: "Dinner", time: "20:00", day: "rest", kcal: 954, p: 55, c: 100, f: 33, ing: [ing("Riz complet (cru)", 129, "g"), ing("Saumon (cru)", 210, "g"), ing("Avocat", 13, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal57", name: "Steak-Patate Douce Repos", slot: "Dinner", time: "20:00", day: "rest", kcal: 929, p: 55, c: 100, f: 33, ing: [ing("Patate douce (crue)", 470, "g"), ing("Steak 5% (cuit)", 212, "g"), ing("Huile d'olive", 21, "g"), ing("Légumes verts", 150, "g")] },
    { id: "meal58", name: "Lentilles-Poulet du Dimanche", slot: "Dinner", time: "20:00", day: "rest", kcal: 921, p: 55, c: 100, f: 33, ing: [ing("Lentilles (crues)", 150, "g"), ing("Blanc de poulet (cuit)", 11, "g"), ing("Huile d'olive", 30, "g"), ing("Légumes verts", 150, "g"), ing("Skyr", 100, "g")] },
    { id: "meal59", name: "Pois Chiches-Feta Repos", slot: "Dinner", time: "20:00", day: "rest", kcal: 917, p: 55, c: 100, f: 33, ing: [ing("Pois chiches (cuits)", 333, "g"), ing("Blanc de poulet (cuit)", 46, "g"), ing("Huile d'olive", 12, "g"), ing("Feta", 50, "g"), ing("Légumes verts", 200, "g")] },
    { id: "meal60", name: "Dinde-Quinoa Complet", slot: "Dinner", time: "20:00", day: "rest", kcal: 933, p: 55, c: 100, f: 33, ing: [ing("Quinoa (cru)", 142, "g"), ing("Escalope de dinde (cuite)", 89, "g"), ing("Huile d'olive", 22, "g"), ing("Légumes verts", 150, "g"), ing("Fromage blanc 3%", 80, "g")] },
  ];
}

export function buildSeed(hydrationTargetL) {
  const today = new Date();
  const mon = monday(today);
  const tk = iso(today);

  const sessions = {};
  for (let i = -21; i < 14; i++) {
    const d = addDays(mon, i);
    sessions[iso(d)] = DEFAULT_PLAN[d.getDay()];
  }

  const meals = buildMeals();

  const times = [];
  const hist = [
    ["100 m", 11.62], ["60 m", 7.42], ["100 m", 11.55], ["200 m", 23.9], ["100 m", 11.48],
    ["60 m", 7.31], ["100 m", 11.42], ["200 m", 23.55], ["100 m", 11.38], ["60 m", 7.24], ["100 m", 11.34],
  ];
  hist.forEach((h, i) => {
    times.push({ id: "c" + i, date: iso(addDays(today, -((hist.length - i) * 17))), dist: h[0], t: h[1], kind: i % 3 === 1 ? "training" : "test" });
  });

  const recovery = {};
  [
    [1, { fatigue: 7, sleep: 6, technique: 7, speed: 6, pain: 8, motivation: 8 }],
    [2, { fatigue: 5, sleep: 5, technique: null, speed: null, pain: 7, motivation: 6 }],
    [3, { fatigue: 8, sleep: 8, technique: 8, speed: 8, pain: 9, motivation: 9 }],
    [5, { fatigue: 6, sleep: 7, technique: 6, speed: 7, pain: 7, motivation: 7 }],
    [7, { fatigue: 4, sleep: 4, technique: 5, speed: 4, pain: 6, motivation: 5 }],
  ].forEach((pair) => {
    const k = iso(addDays(today, -pair[0]));
    recovery[k] = Object.assign({}, RECOV_DEFAULT, pair[1], { type: sessions[k] || DEFAULT_PLAN[parseIso(k).getDay()] });
  });

  return {
    version: 4,
    mealSetVersion: 2,
    weeklyDigest: { fired: {} },
    startWeek: iso(mon),
    hydra: { targetL: hydrationTargetL ?? 3, slots: ["07:30", "10:00", "12:30", "15:00", "17:30", "20:00"], done: {}, glasses: {}, fired: {} },
    sessions, meals, picks: {}, mealChoice: {}, mealsDone: {}, shopExtra: [], shopQty: {}, shopHidden: {}, bought: {},
    flashDecks: [{ id: "fd1", name: "Spanish — Essentials" }],
    flashCards: buildFlashcards(),
    times, recovery,
    targets: [
      { id: "o1", dist: "100 m", t: 11.2, due: "2026-12-25", label: "Christmas" },
      { id: "o2", dist: "100 m", t: 10.95, due: "2027-07-15", label: "July" },
      { id: "o3", dist: "60 m", t: 6.92, due: "2027-07-15", label: "July" },
    ],
    goals: [
      { id: "g1", domain: "sport", title: "Break 11.00 over 100 m", due: "2027-07-15", done: false },
      { id: "g2", domain: "sport", title: "Zero missed session this month", due: "2026-09-30", done: false },
      { id: "g3", domain: "pro", title: "Launch the portfolio site", due: "2026-11-30", done: false },
      { id: "g4", domain: "money", title: "£20,000 saved and invested", due: "2027-12-31", done: false },
      { id: "g5", domain: "growth", title: "English C1 · Spanish B2", due: "2027-06-30", done: false },
      { id: "g6", domain: "health", title: "7 h 30 of sleep on average", due: "2026-12-31", done: false },
      { id: "g7", domain: "social", title: "One real evening with friends a week", due: "2026-12-31", done: false },
      { id: "g8", domain: "create", title: "Twelve written pieces this year", due: "2026-12-31", done: false },
      { id: "g9", domain: "freedom", title: "Three weeks abroad, self-funded", due: "2027-08-31", done: false },
    ],
    tasks: [
      { id: "t1", title: "30 min of Spanish", goal: "g5", repeat: "daily", date: tk, done: {} },
      { id: "t2", title: "Ten minutes of mobility", goal: "g6", repeat: "daily", date: tk, done: {} },
      { id: "t3", title: "Write 300 words", goal: "g8", repeat: "daily", date: tk, done: {} },
      { id: "t4", title: "Gym session — squat 5×5", goal: "g1", repeat: "once", date: tk, done: {} },
      { id: "t5", title: "Weekly groceries", goal: "g6", repeat: "weekly", date: tk, done: {} },
      { id: "t6", title: "Write the projects page", goal: "g3", repeat: "weekly", date: tk, done: {} },
      { id: "t7", title: "Transfer £400 to savings", goal: "g4", repeat: "monthly", date: tk, done: {} },
      { id: "t8", title: "Book one trip leg", goal: "g9", repeat: "monthly", date: tk, done: {} },
    ],
    ideas: [
      { id: "i1", text: "A monthly newsletter on sprint training — one session broken down, one thing I got wrong.", date: iso(addDays(today, -3)) },
      { id: "i2", text: "“You do not rise to the level of your goals, you fall to the level of your systems.”\nWorth pinning above the desk.", date: iso(addDays(today, -2)) },
      { id: "i3", text: "Noticed I get defensive whenever someone questions my training plan. Probably because I am not sure of it myself.", date: iso(addDays(today, -1)) },
    ],
    books: [
      { id: "b1", title: "Peak", author: "Anders Ericsson", status: "Finished", rating: 9, review: "The key point: feedback quality beats volume. Changed how I structure a session.", quotes: ["Deliberate practice requires feedback and modification of efforts in response to that feedback."] },
      { id: "b2", title: "The Science of Speed", author: "Sprint biomechanics", status: "Reading", rating: 7, review: "The chapter on ground contact and stiffness is worth the whole book.", quotes: [] },
      { id: "b3", title: "The Intelligent Investor", author: "Benjamin Graham", status: "To read", rating: 0, review: "", quotes: [] },
    ],
    skills: [
      { id: "sk1", name: "Race video analysis", note: "240 fps slow-mo plus a foot-strike grid.", status: "learned", date: iso(addDays(today, -6)) },
      { id: "sk2", name: "Batch cooking", note: "Two hours on Sunday covers five lunches.", status: "learned", date: iso(addDays(today, -13)) },
      { id: "sk3", name: "Basic SQL", note: "Enough to query my own training log.", status: "planned", date: iso(addDays(today, 12)) },
      { id: "sk4", name: "Sports massage self-care", note: "For calves and hamstrings between track days.", status: "planned", date: iso(addDays(today, 26)) },
    ],
    learnings: [
      { id: "l1", date: iso(addDays(today, -1)), text: "Ground contact time matters more than stride length at top speed — cueing “push the ground away” beats reaching." },
      { id: "l2", date: iso(addDays(today, -2)), text: "Writing the shopping list straight from the meal plan removes about twenty minutes of decision-making a week." },
      { id: "l3", date: iso(addDays(today, -4)), text: "When I sleep under six hours, my technique score drops before my fatigue score does. Sleep is the leading indicator." },
    ],
  };
}
