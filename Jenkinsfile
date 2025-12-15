pipeline {
    agent any

    environment {
        SONAR_HOST  = 'http://54.173.3.142:9000'
        SONAR_TOKEN = credentials('sonar-token')
    }

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/awsbasava6/M1.git'
            }
        }

        stage('FE Build') {
            steps {
                sh '''
                  node -v
                  npm -v
                  cd client
                  npm install
                  npm run build
                '''
            }
        }

        stage('BE Build') {
            steps {
                sh '''
                  cd server
                  npm install
                '''
            }
        }

       stage('SonarQube Scan') {
    steps {
        script {
            def scannerHome = tool 'sonar-scanner'
            withSonarQubeEnv('sonar') {
                sh """
                  ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=v1-fe-be \
                    -Dsonar.sources=client/src,server
                """
            }
        }
    }
}

        stage('Docker Build') {
            steps {
                sh '''
                  docker build -t v1-fe:latest client
                  docker build -t v1-be:latest server
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                  trivy image --exit-code 1 --severity HIGH,CRITICAL v1-fe:latest
                  trivy image --exit-code 1 --severity HIGH,CRITICAL v1-be:latest
                '''
            }
        }
    }
}
