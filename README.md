# Brèves AMF

- Application déployée : https://finadory-prototype.vercel.app

## 1. Choix techniques

- Frontend : Next.js / React
- Backend : Node.js / TypeScript
- LLM pour la rédaction des brèves : claude-opus-5-5 (prompt `v2-citations`)
- Base de données : Supabase
- Serveur / hébergement : Vercel

## 2. Comment j'ai compris la structure des données

Pour comprendre la structure des données, je me suis appuyé sur la page data.gouv et sur Claude Code, que j'ai utilisé pour explorer les différents endpoints, voir quelles données étaient renvoyées et surtout ce qu'elles représentaient (~1 h).

J'ai ensuite exploré les différentes structures renvoyées et commencé à identifier les points sensibles :

- les doublons FR/EN (pour l'instant je ne garde que les publications en français) ;
- les ISIN `9999…` ;
- les titres génériques ;
- les sous-types encodés en texte ;
- les chiffres au format irrégulier dans les PDF.

## 3. Critère de sélection des publications

Pour sélectionner les 3 à 5 publications j'ai construit un système de points simple. Les publications de routine (droits de vote, rachats d'actions, mises à disposition de documents) sont écartées. Les autres sont notées selon :

- **Des mots-clés qui sortent de l'ordinaire (+2 points)** :

  ```
  "acquisition", "cession", "fusion", "OPA", "offre publique", "objectif",
  "prévision", "relève", "abaisse", "avertissement", "nomination",
  "démission", "augmentation de capital", "contrat", "partenariat"
  ```

- **Entreprise membre du CAC 40 (+2 points)**

- **Sous-types ciblés** :

  ```
  "001002": { points: 3, label: "Opération de l'émetteur" },
  "023000": { points: 2, label: "Franchissement de seuil" },
  "001006": { points: 1, label: "Information privilégiée" },
  ```

  Les résultats (résultats trimestriels, semestriels, annuels) valent +3 points.

On garde ensuite les 5 meilleurs scores, avec au maximum une publication par société.

## 4. Comment je contrôle l'exactitude des chiffres

J'envoie le PDF complet de la publication à Claude, avec la fonction citations activée. Elle permet à Claude de rattacher à chaque phrase qu'il écrit le passage exact du document sur lequel elle s'appuie, avec le numéro de page. Ce passage cité est extrait du PDF par l'API elle-même : le modèle choisit quoi citer, mais il ne peut pas l'inventer.

Mon code vérifie ensuite chaque chiffre : pour chaque phrase j'extrais tous les nombres et je les compare au passage cité pour cette phrase. Trois états sont possibles :

- **Vérifié** : le nombre figure dans le passage cité.
- **À vérifier** : il n'y est pas mais il apparaît ailleurs dans le PDF (mauvais contexte).
- **Introuvable** : il n'apparaît nulle part dans le PDF.

Avant de comparer je normalise toujours l'écriture des nombres.

## 5. Trois prompts clés

1. **Cadrer le travail** : je donne le contexte à Claude, puis je mets en place une spec, puis un plan d'implémentation.
   - Exemple : « Voici le contexte du projet : {…}. Prends-en connaissance et si des points te paraissent flous, pose-moi les questions nécessaires. »
2. **Le front** : je lui envoie toujours le résultat que je souhaite sous forme de capture d'écran.
   - Exemple : « Je veux que tu me structures la page sous forme de grille comme sur cette capture d'écran. »
3. **Le prompt système de génération des brèves** (`lib/prompts.ts`) :

```
You are a financial news editor for Clardot, a French regulatory-monitoring platform whose motto is "the signal, not the noise". You write short news briefs from ONE official filing published on info-financiere.gouv.fr (French market authority, AMF). The filing is attached as a PDF document with citations enabled.

Source
- Use only the attached document. No outside knowledge, no market context, no assumptions, no web. If a fact is not in the document, do not write it.
- Cite the document for every factual sentence, and always for any sentence that contains a figure.

Figures (critical: every figure is machine-checked against the passage you cite)
- Copy every number exactly as written in the document: same digits, same decimal comma, same unit, same sign. Never convert units, round, add up, or compute a variation yourself.
- Prefer fewer figures you can cite over more figures you cannot.

Output (in French, plain text, exactly these markers, nothing before or after)
TITRE: <starts with the company and a verb, states the key fact, about 12 words max. Example: "Legrand relève ses objectifs 2026 après neuf mois solides">
CHAPÔ: <one sentence carrying the key figure>
CORPS:
<100 to 150 words. Factual, neutral, short sentences. Company claims ("record", "très solide") must be attributed ("selon la société").>
FAITS CLÉS:
- <3 to 5 short facts, one per line>

Not enough material
- If the document cannot support a factual brief (e.g. it only announces that a document is available), answer only:
INSUFFISANT: <reason, in French>
```

## 6. Erreurs de l'IA que j'ai détectées

- **Filtre de dates incohérent** : dans les filtres de recherche, le champ des dates n'était pas cohérent, je pouvais chercher dans le passé (au-delà de 7 jours) ou dans le futur.
- **Téléchargement des PDF non sécurisé** : l'IA ne vérifiait jamais l'URL lors de la récupération des PDF (hôte, redirection, etc.).

## 7. Idées d'amélioration

- Traiter les doublons FR/EN pour avoir une version de chaque langue.
- Mettre en place du décodage contraint pour les chiffres dans les brèves.
- Accepter d'autres formats que le PDF comme publications.
- Ajouter un profil personnalisable et des fonctionnalités comme liker, mettre en favori ou partager facilement une publication.
- Ajouter un chatbot qui permet de poser des questions sur une publication précise.
- Ajouter une voix de synthèse avec l'IA.
- Mettre en place un cron qui récupère les nouvelles publications tous les jours (import, sélection et génération des brèves automatiques), au lieu de données figées.
- Étendre à d'autres registres officiels (BODACC, Journal officiel, BOAMP…), comme le fait Clardot.
- Créer un backend complet (API dédiée, file de traitement pour les PDF et la génération) plutôt que des scripts lancés en local.

## 8. Temps passé

1h pour l'exploration puis 2h pour l'implémentation.

## Inspirations

- https://pollar.news/fr (fonctionnalités et frontend)
- https://dune.com/home (frontend)
