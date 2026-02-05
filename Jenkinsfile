// Jenkins Pipeline for Playwright Tests
pipeline {
    agent any

    environment {
        // Credentials are injected from Jenkins Credentials Store (encrypted)
        // Add in: Jenkins -> Credentials -> System -> Global credentials
        PVM_CREDENTIALS = credentials('pvm-credentials-id')
        PVM_URL = 'https://devpvpm.practicevelocity.com/'
    }

    stages {
        stage('Setup') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 18') {
                    sh 'npm ci'
                }
            }
        }

        stage('Install Browsers') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 18') {
                    sh 'npx playwright install --with-deps'
                }
            }
        }

        stage('Run Tests') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 18') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'pvm-credentials-id',
                            usernameVariable: 'PVM_USERNAME',
                            passwordVariable: 'PVM_PASSWORD'
                        )
                    ]) {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Archive Results') {
            steps {
                archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true
                archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            junit testResults: '**/test-results.xml', allowEmptyResults: true
        }
    }
}
