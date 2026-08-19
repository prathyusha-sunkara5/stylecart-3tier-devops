pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(false)
    }

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = 'REPLACE_WITH_AWS_ACCOUNT_ID'
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
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend Build Check') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t ${ECR_REGISTRY}/${FRONTEND_REPOSITORY}:${IMAGE_TAG} ./frontend
                    docker build -t ${ECR_REGISTRY}/${BACKEND_REPOSITORY}:${IMAGE_TAG} ./backend
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} |
                          docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        aws ecr describe-repository --repository-name ${FRONTEND_REPOSITORY} --region ${AWS_REGION} >/dev/null 2>&1 ||
                          aws ecr create-repository --repository-name ${FRONTEND_REPOSITORY} --region ${AWS_REGION}

                        aws ecr describe-repository --repository-name ${BACKEND_REPOSITORY} --region ${AWS_REGION} >/dev/null 2>&1 ||
                          aws ecr create-repository --repository-name ${BACKEND_REPOSITORY} --region ${AWS_REGION}

                        docker push ${ECR_REGISTRY}/${FRONTEND_REPOSITORY}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${BACKEND_REPOSITORY}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh '''
                        aws ecs update-service \
                          --cluster ${ECS_CLUSTER} \
                          --service ${FRONTEND_SERVICE} \
                          --force-new-deployment \
                          --region ${AWS_REGION}

                        aws ecs update-service \
                          --cluster ${ECS_CLUSTER} \
                          --service ${BACKEND_SERVICE} \
                          --force-new-deployment \
                          --region ${AWS_REGION}
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
        success {
            echo 'StyleCart CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'StyleCart pipeline failed. Check the stage logs.'
        }
    }
}
