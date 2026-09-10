# CityPulse

CityPulse est une plateforme d'analyse de mobilité urbaine.

Elle permet de visualiser le trafic, de détecter les anomalies et de contrôler la qualité des données.

> Les données de trafic présentes dans `demo_traffic.csv` sont synthétiques.
> Les données live actuellement disponibles concernent la météo et la qualité
> de l'air à Abidjan.

## Fonctionnalités

- Dashboard analytique
- KPI de mobilité
- Graphique d'évolution du trafic
- Détection statistique d'anomalies
- Explication des anomalies
- Contrôle de la qualité des données
- API REST avec FastAPI
- Interface responsive avec Next.js
- Tests automatisés
- Docker
- GitHub Actions

## Architecture

```text
CSV
 |
 v
Pandas
 |
 v
FastAPI
 |
 v
Next.js
 |
 v
Dashboard

Stack technique
Frontend

    Next.js
    React
    TypeScript
    Tailwind CSS
    Recharts

Backend

    Python
    FastAPI
    Pandas
    Pytest

DevOps

    Docker
    Docker Compose
    GitHub Actions

Installation locale
Backend
bash
Copy

cd backend
python -m venv venv

Windows :
bash
Copy

venv\Scripts\activate

macOS/Linux :
bash
Copy

source venv/bin/activate

Installer les dépendances :
bash
Copy

pip install -r requirements.txt

Lancer l'API :
bash
Copy

uvicorn app.main:app --reload

API disponible sur :
text
Copy

http://localhost:8000

Documentation :
text
Copy

http://localhost:8000/docs

Frontend
bash
Copy

cd frontend
npm install
npm run dev

Application disponible sur :
text
Copy

http://localhost:3000

Endpoints API
Endpoint	Description
/api/health	Vérification du service
/api/kpis	KPI principaux
/api/traffic	Données de trafic
/api/anomalies	Anomalies détectées
/api/data-quality	Qualité des données
Méthode de détection

Les anomalies sont détectées avec un score Z.
text
Copy

z_score = (valeur - moyenne) / écart-type

Une observation est considérée comme anormale lorsque la valeur absolue du score Z est supérieure ou égale à 1.

Cette méthode est adaptée à une démonstration, mais une version de production nécessiterait davantage de données historiques et une calibration métier.
Limites

    Les données actuelles sont synthétiques.
    La corrélation météo-trafic ne prouve pas une causalité.
    Le volume de données est faible.
    Le système d'anomalie doit être recalibré avec des données réelles.

Roadmap

    Ajouter Open-Meteo
    Ajouter plusieurs villes
    Ajouter une base PostgreSQL
    Ajouter une carte interactive
    Ajouter des alertes email
    Ajouter des prévisions
    Déployer l'application


## Données live

CityPulse collecte automatiquement des données réelles pour Abidjan :

- température ;
- humidité ;
- précipitations ;
- vitesse du vent ;
- PM2.5 ;
- PM10 ;
- ozone ;
- dioxyde d'azote ;
- monoxyde de carbone.

### Coordonnées

- Ville : Abidjan
- Latitude : 5.3599517
- Longitude : -4.0082563
- Fuseau horaire : Africa/Abidjan

### Sources

- Open-Meteo Weather API
- Open-Meteo Air Quality API
- OpenStreetMap pour la cartographie

Les données sont synchronisées toutes les 15 minutes et conservées localement dans SQLite.

## Limites actuelles

Les données de trafic routier réel d'Abidjan ne sont pas encore intégrées.
Le trafic synthétique est conservé uniquement dans un fichier séparé de démonstration et n'est pas présenté comme une donnée réelle.

Projet Data Analyst / Full Stack Developer.

---

# `.gitignore`

Crée ou complète `.gitignore` à la racine :

```gitignore
# Python
__pycache__/
*.py[cod]
*.pyo
venv/
.env

# Tests
.pytest_cache/
.coverage

# Next.js
frontend/node_modules/
frontend/.next/
frontend/out/

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/