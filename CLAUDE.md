# Finadory — exercice technique (stage)

@AGENTS.md

Exercice d'évaluation demandé par Maxime (CEO de Finadory, venture builder parisien) pour un stage de 6 mois. Le code ne sera pas réutilisé, mais Thomas le **défendra pendant 45 min** : chaque choix doit être explicable par lui.

## Mode de travail

- On construit **main dans la main** : Thomas guide, Claude apporte un regard extérieur et critique, et aide quand c'est demandé. Pas de gros blocs de code non discutés.
- Échanger en **français**.
- **Budget : 3 à 4 h, 5 h maximum.** Prioriser. Un rendu incomplet mais bien expliqué est accepté.
- Noter au fil de l'eau, pour le README : les décisions, les prompts clés, les **erreurs de l'IA détectées** et le temps passé.

## Règles de code

Objectif : un code lisible et maintenable.
- **Commentaires : au plus une ligne au-dessus de chaque fonction.** Pas de blocs de commentaires, pas de commentaires en fin de ligne.
- **Fonctions de moins de 50 lignes.** Au-delà, découper.
- **Fichiers de moins de 500 lignes.** Au-delà, découper.
- **Code en anglais** : commentaires, noms de fonctions, de variables et de fichiers, et messages d'erreur. Seuls les textes affichés à l'utilisateur (interface, libellés du score, contenu des brèves) restent en français.

## L'énoncé (résumé fidèle)

Une web app qui récupère les publications réglementées d'info-financiere.gouv.fr (AMF) et en tire des **brèves d'actualité fiables**. Fonctionnalités, **par ordre de priorité** :

1. Récupérer les publications d'une période récente (quelques jours).
2. Les stocker et les afficher dans une liste filtrable par **société, type d'information et date**.
3. **Sélectionner automatiquement** les publications qui méritent un article, et expliquer le critère.
4. Pour **3 à 5** publications retenues, générer avec un LLM une brève de **100 à 150 mots** : titre, faits clés, chiffres, lien vers le document source.
5. **Vérifier que les chiffres de la brève figurent dans le document source** et signaler les cas non vérifiables. Une approche simple suffit, l'important est de l'expliquer.

Livrables : le repo GitHub, l'URL déployée, et un README contenant les choix techniques, la compréhension des données, le critère de sélection, le contrôle des chiffres, 3 prompts clés et une erreur de l'IA détectée, les améliorations possibles et le temps réellement passé.

## Stack (décidée)

Next.js + Supabase, déployé sur Vercel. LLM : **API Anthropic** (Claude). La génération des brèves est **intégrée à l'app** (route API). Plan B si le temps manque : brèves générées à la main, et explication dans le README.

## Référence produit : Clardot (clardot.com)

La plateforme de veille de Finadory. Ses principes doivent guider nos choix et être cités dans le README :
- « Le signal, pas le bruit. » → le critère de sélection.
- « Chaque information renvoie au texte officiel », avec sa date → lien vers le PDF et date AMF sur chaque brève.
- « Chaque signal est recoupé » / « Un signal inexact publié vite ne rend service à personne. » → la vérification. Une brève non vérifiée est signalée, jamais corrigée en silence.
- « Pas de rumeur, pas de web ouvert. » → le LLM n'utilise que le document fourni.
- Format des articles : un titre avec un verbe et le fait marquant, une étiquette (« Sociétés cotées »), un chapô d'une phrase avec le chiffre clé. Chaque signal affiche sa raison (« Correspond à vos mots-clés »).

## Source de données

- API Opendatasoft Explore v2.1, publique et sans clé : `https://www.info-financiere.gouv.fr/api/explore/v2.1/catalog/datasets/flux-amf-new-prod/records`
- Paramètres : `where` (ODSQL, par ex. `uin_dat_amf >= now(days=-7)`), `select`, `group_by`, `order_by` (`champ asc|desc`), `limit` (100 max), `offset` (`offset + limit` ≤ 10 000).
- Volume mesuré : environ 592 publications sur 7 jours, dont environ 379 en français.
- Tables de référence (`types-dinformation`, `sous-type-dinformation`…) figées depuis 2018 et **incomplètes** : les codes 001xxx n'y figurent pas.

### Champs utiles

| Champ | Rôle |
|---|---|
| `uin_idt_uin` | Clé unique de la publication |
| `uin_dat_amf` | Date de publication officielle (UTC, voir plus bas) |
| `identificationsociete_iso_nom_soc` | Nom de la société |
| `identificationsociete_iso_cd_lei` | LEI : meilleur identifiant de société (~99 % rempli) |
| `identificationsociete_iso_cd_isi` | ISIN (`999999999999` = valeur bidon, pour les émetteurs de dette) |
| `informationdeposee_inf_tit_inf` | Titre (souvent générique) |
| `informationdeposee_inf_lng_inf` | `Français` / `Anglais` |
| `type_d_information` / `sous_type_d_information` | Type (4 valeurs) / sous-type (14 valeurs) |
| `informationdeposee_inf_stp_pri` | Code du sous-type principal, plus fin que le libellé |
| `url_de_recuperation` | Lien vers le document source (PDF dans environ 97 % des cas, parfois ZIP ou DOCX) |
| `cac40` / `name_cac40` | `1` / `0` / `null` (`null` ≠ « hors CAC 40 ») |

### Imperfections connues (traitement décidé)

- **Doublons FR/EN** (environ 62 % du flux) → **on ne garde que le français**, filtré dans la requête : `informationdeposee_inf_lng_inf = "Français"`. On perd environ 30 publications en anglais seulement. Amélioration future : regrouper les paires FR/EN par même LEI, même sous-type et moins de 5 min d'écart (43 paires sont décalées de 1 à 5 min).
- Dates stockées en **UTC**. C'est une déduction : les pics de publication à 06:00, 16:45 et 17:00 UTC correspondent à 07:00, 17:45 et 18:00 à Paris. → Stocker en UTC, afficher en Europe/Paris.
- ISIN et ticker `9999…` → `null`. LEI manquant (5 cas) → repli sur le nom.
- `uin_dat_mar` peu fiable (date sentinelle `8887-12-31`) → ignoré. `inf_dat_emt` est identique à `uin_dat_amf`.
- `inf_stp_inf` contient parfois une liste encodée en texte (`'["001007","005002"]'`) → utiliser `stp_pri`.
- Statut toujours `NEW` : aucun suivi des rectificatifs.
- Champs vides ou constants : code AMF, URLs de site et de logo, versions de format, code marché, `filename`, `*_ancien`.
- Titres génériques (environ 66 sur 7 jours, par ex. « Informations privilégiées / Autres communiqués ») → ne pas fonder la sélection sur le titre seul.
- PDF : texte extractible, mais longs (33 pages pour Air France-KLM), et chiffres au format français irrégulier (« 1 346 millions », « 9,9 milliards », « +0,1 % », espaces doubles, sauts de ligne au milieu d'un nombre).
- Principe : **stocker le brut** (colonne `raw` en JSON) **et les colonnes nettoyées à côté**. Import en *upsert* sur `uin_idt_uin`, trié par `uin_dat_amf asc, uin_idt_uin asc`.

## Critère de sélection (décidé dans le principe)

Faire ressortir **ce qui sort du lot**, avec un barème de points simple et assumé :
- **Bruit écarté** (score de 0) : droits de vote (006000), rachats d'actions (013007), modalités de mise à disposition (002xxx), État membre d'origine (014000).
- **Points** : opération de l'émetteur `001002` (+3), résultats `001007` / trimestriels / semestriels (+3), franchissement de seuil (+2), autres informations privilégiées `001006` (+1), mot-clé fort dans le titre (+2), CAC 40 (+2).
- Significations des codes 001xxx **déduites des titres génériques** : 001002 = opérations de l'émetteur, 001007 = comptes et résultats, 001006 = autres communiqués.
- Top 3 à 5, **une publication par société au maximum**. Chaque publication retenue affiche « Retenue parce que… ».

## Vérification des chiffres (décidée dans le principe)

Ne concerne **que les 3 à 5 brèves générées**, chacune comparée au PDF de sa publication.
1. Le LLM renvoie chaque chiffre avec une **citation exacte** du document.
2. Le code extrait lui-même **tous** les nombres de la brève (regex), normalise ceux de la brève et ceux du PDF (espaces, virgule, unités), puis cherche chaque nombre et chaque citation dans le PDF.
3. Statut par chiffre : ✅ nombre et citation trouvés · ⚠️ nombre trouvé mais citation absente ou format différent · ❌ introuvable. La brève prend le statut de son pire chiffre.
- Limites : un nombre présent n'est pas forcément utilisé dans le bon contexte. Les années et trimestres sont à exclure ou tolérer. Les pages non lues produisent de faux ❌.

## Pour le README : limites du score assumées (décision de Thomas)

- Faux positif connu : Orange, « acquisition d'actions propres » (un rachat d'actions déposé comme info privilégiée) obtient 5 grâce au mot-clé « acquisition ». Pas de correctif au cas par cas.
- Top 5 dominé par les résultats T3 du CAC 40 (9 ex aequo à 5, départagés par la date) : c'est voulu, car en saison de résultats, c'est ce qu'attendent les lecteurs.
- L'API ne fournit aucun signal de popularité ou d'audience : le CAC 40 sert d'approximation.

## Pour le README : erreurs de l'IA déjà détectées

1. Claude a utilisé un champ inventé (`order_by=-date_de_publication`) → l'API a renvoyé `Unknown field`.
2. Claude a conclu à tort qu'il n'y avait que 78 URLs distinctes sur 592 : son script tronquait les valeurs à 70 caractères avant de les compter. Il y en a en réalité 592, toutes uniques.
3. Première clé de regroupement FR/EN « même minute » : elle ratait 43 paires décalées de 1 à 5 min.
4. Longueur non respectée par le modèle : le corps de la brève Engie fait 182 mots, celui de Publicis 157 (consigne : 100 à 150). Signalé à l'affichage, non corrigé.
5. Glissade éditoriale à surveiller : le titre « Bouygues relève son objectif » interprète « vise une légère hausse » comme un relèvement.
6. Faux ❌ de NOTRE vérification (et non de l'IA) : dans les tableaux, l'extraction PDF colle les cellules (« 1 067,0892,3 », « 306675 »). Corrigé par une recherche en sous-chaîne pour les nombres de 3 chiffres ou plus, avec un test qui reproduit le cas Legrand.

## Pour le README : génération et vérification (décisions)

- Génération avec l'**API Citations** (idée de Thomas) : le PDF complet est passé en bloc `document`, et l'API rattache à chaque phrase un `cited_text` extrait du document (pas écrit par le modèle). Incompatible avec la sortie structurée, d'où un texte balisé (TITRE / CHAPÔ / CORPS / FAITS CLÉS) découpé par `parseBriefText`.
- Vérification : un nombre est ✅ s'il figure dans le passage cité pour sa phrase, ⚠️ s'il n'est qu'ailleurs dans le PDF, ❌ s'il est absent. Années, T3/S1 et dates ignorées. Résultat : 5 brèves sur 5 vérifiées (104 chiffres).
- Limite : pour un tableau, l'API cite toute la page (environ 1 270 caractères), donc le contrôle « dans le passage cité » est moins précis.
- Premier lancement : 13 erreurs « credit balance too low » (crédits API absents sur la clé), relancé ensuite.
- Modèle `claude-opus-5-5` (défaut du skill claude-api), effort `medium`, `fallbacks: "default"`.
