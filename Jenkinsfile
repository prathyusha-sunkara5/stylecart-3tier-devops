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
                    echo "Building StyleCart Docker images..."

                    docker build \
                      -t $ECR_REGISTRY/$FRONTEND_REPOSITORY:$IMAGE_TAG \
                      -t $ECR_REGISTRY/$FRONTEND_REPOSITORY:latest \
                      ./frontend

                    docker build \
                      -t $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG \
                      -t $ECR_REGISTRY/$BACKEND_REPOSITORY:latest \
                      ./backend
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
                    sh '''
                        echo "Logging in to Amazon ECR..."

                        aws ecr get-login-password \
                          --region $AWS_REGION | \
                        docker login \
                          --username AWS \
                          --password-stdin $ECR_REGISTRY

                        echo "Pushing frontend images..."

                        docker push $ECR_REGISTRY/$FRONTEND_REPOSITORY:$IMAGE_TAG
                        docker push $ECR_REGISTRY/$FRONTEND_REPOSITORY:latest

                        echo "Pushing backend images..."

                        docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG
                        docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:latest
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
                    sh '''
                        echo "Starting frontend ECS deployment..."

                        aws ecs update-service \
                          --cluster $ECS_CLUSTER \
                          --service $FRONTEND_SERVICE \
                          --force-new-deployment \
                          --region $AWS_REGION \
                          > /dev/null

                        echo "Starting backend ECS deployment..."

                        aws ecs update-service \
                          --cluster $ECS_CLUSTER \
                          --service $BACKEND_SERVICE \
                          --force-new-deployment \
                          --region $AWS_REGION \
                          > /dev/null

                        echo "ECS deployments triggered successfully."
                    '''
                }
            }
        }

        stage('Wait for ECS Deployment') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'stylecart-aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        echo "Waiting for ECS deployments to complete..."
                        echo "Maximum wait time: 20 minutes"

                        for i in $(seq 1 60); do

                            FRONTEND_STATUS=$(aws ecs describe-services \
                              --cluster $ECS_CLUSTER \
                              --services $FRONTEND_SERVICE \
                              --region $AWS_REGION \
                              --query "services[0].deployments[?status=='PRIMARY'].rolloutState | [0]" \
                              --output text)

                            BACKEND_STATUS=$(aws ecs describe-services \
                              --cluster $ECS_CLUSTER \
                              --services $BACKEND_SERVICE \
                              --region $AWS_REGION \
                              --query "services[0].deployments[?status=='PRIMARY'].rolloutState | [0]" \
                              --output text)

                            FRONTEND_RUNNING=$(aws ecs describe-services \
                              --cluster $ECS_CLUSTER \
                              --services $FRONTEND_SERVICE \
                              --region $AWS_REGION \
                              --query "services[0].runningCount" \
                              --output text)

                            BACKEND_RUNNING=$(aws ecs describe-services \
                              --cluster $ECS_CLUSTER \
                              --services $BACKEND_SERVICE \
                              --region $AWS_REGION \
                              --query "services[0].runningCount" \
                              --output text)

                            echo "--------------------------------------"
                            echo "ECS deployment check $i/60"
                            echo "Frontend rollout : $FRONTEND_STATUS"
                            echo "Frontend running : $FRONTEND_RUNNING"
                            echo "Backend rollout  : $BACKEND_STATUS"
                            echo "Backend running  : $BACKEND_RUNNING"
                            echo "--------------------------------------"

                            if [ "$FRONTEND_STATUS" = "FAILED" ] || \
                               [ "$BACKEND_STATUS" = "FAILED" ]; then

                                echo "ERROR: ECS deployment failed."

                                aws ecs describe-services \
                                  --cluster $ECS_CLUSTER \
                                  --services $FRONTEND_SERVICE $BACKEND_SERVICE \
                                  --region $AWS_REGION \
                                  --query "services[*].[serviceName,events[0:5].message]" \
                                  --output json

                                exit 1
                            fi

                            if [ "$FRONTEND_STATUS" = "COMPLETED" ] && \
                               [ "$BACKEND_STATUS" = "COMPLETED" ] && \
                               [ "$FRONTEND_RUNNING" -ge 1 ] && \
                               [ "$BACKEND_RUNNING" -ge 1 ]; then

                                echo "SUCCESS: Both ECS deployments completed."
                                exit 0
                            fi

                            echo "Deployment still in progress. Waiting 20 seconds..."
                            sleep 20
                        done

                        echo "ERROR: ECS deployment did not complete within 20 minutes."

                        aws ecs describe-services \
                          --cluster $ECS_CLUSTER \
                          --services $FRONTEND_SERVICE $BACKEND_SERVICE \
                          --region $AWS_REGION \
                          --query "services[*].[serviceName,runningCount,pendingCount,deployments[*].rolloutState]" \
                          --output json

                        exit 1
                    '''
                }
            }
        }

        stage('Verify ECS Services') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'stylecart-aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        echo "Final ECS service status:"

                        aws ecs describe-services \
                          --cluster $ECS_CLUSTER \
                          --services $FRONTEND_SERVICE $BACKEND_SERVICE \
                          --region $AWS_REGION \
                          --query "services[*].{Service:serviceName,Desired:desiredCount,Running:runningCount,Pending:pendingCount,Rollout:deployments[?status=='PRIMARY']|[0].rolloutState}" \
                          --output table
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
            echo '============================================'
            echo 'StyleCart CI/CD pipeline completed successfully.'
            echo 'GitHub -> Webhook -> Jenkins -> Docker -> ECR -> ECS'
            echo '============================================'
        }

        failure {
            echo '============================================'
            echo 'StyleCart CI/CD pipeline failed.'
            echo 'Check the failed stage logs for details.'
            echo '============================================'
        }
    }
}