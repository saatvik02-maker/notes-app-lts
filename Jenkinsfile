pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/<your-username>/notes-app-lts.git'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Build & Start') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Test Backend') {
            steps {
                sh 'docker exec notes-backend npm test || true'
            }
        }
    }
}
