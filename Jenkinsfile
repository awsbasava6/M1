pipeline {
    agent any

    environment {
        SONAR_HOST  = 'http://13.223.73.106:9000'
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/awsbasava6/M1.git'
            }
        }

}
     stage('FE Build') {
            steps {
                sh '''
                  cd client
                  npm install
                  npm run build
                '''
            }
        }
}
