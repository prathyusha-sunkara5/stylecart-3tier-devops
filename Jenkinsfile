pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(false)
    }

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '955501536964'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        FRONTEND_REPOSITORY = 'stylecart-frontend'
        BACKEND_REPOSITORY = 'stylecart-backend'

        ECS_CLUSTER = 'stylecart-cluster'
        FRONTEND_SERVICE = 'stylecart-frontend-service'
        BACKEND_SERVICE = 'stylecart-backend-service'

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    bat 'npm install'
                    bat 'npm test'
                }
            }
        }

        stage('Frontend Build Check') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat '''
                    docker build -t %ECR_REGISTRY%/%FRONTEND_REPOSITORY%:%IMAGE_TAG% -t %ECR_REGISTRY%/%FRONTEND_REPOSITORY%:latest ./frontend
                    docker build -t %ECR_REGISTRY%/%BACKEND_REPOSITORY%:%IMAGE_TAG% -t %ECR_REGISTRY%/%BACKEND_REPOSITORY%:latest ./backend
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'stylecart-aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat '''
                        aws ecr get-login-password --region %AWS_REGION% > ecr-password.txt
                        type ecr-password.txt | docker login --username AWS --password-stdin %ECR_REGISTRY%
                        del ecr-password.txt

                        docker push %ECR_REGISTRY%/%FRONTEND_REPOSITORY%:%IMAGE_TAG%
                        docker push %ECR_REGISTRY%/%FRONTEND_REPOSITORY%:latest

                        docker push %ECR_REGISTRY%/%BACKEND_REPOSITORY%:%IMAGE_TAG%
                        docker push %ECR_REGISTRY%/%BACKEND_REPOSITORY%:latest
                    '''
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'stylecart-aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat '''
                        aws ecs update-service --cluster %ECS_CLUSTER% --service %FRONTEND_SERVICE% --force-new-deployment --region %AWS_REGION%
                        aws ecs update-service --cluster %ECS_CLUSTER% --service %BACKEND_SERVICE% --force-new-deployment --region %AWS_REGION%
                    '''
                }
            }
        }

        stage('Wait for ECS') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'stylecart-aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat '''
                        aws ecs wait services-stable --cluster %ECS_CLUSTER% --services %FRONTEND_SERVICE% %BACKEND_SERVICE% --region %AWS_REGION%
                    '''
                }
            }
        }
    }

    post {
        always {
            bat 'docker image prune -f'
        }

        success {
            echo 'StyleCart CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'StyleCart CI/CD pipeline failed. Check the stage logs.'
        }
    }
}
