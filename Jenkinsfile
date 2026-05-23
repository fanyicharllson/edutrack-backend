pipeline {
  agent any
  environment {
    IMAGE    = "charllson717/edutrack-api"
    TAG      = "${BUILD_NUMBER}"
    NODE_ENV = "test"
  }
  stages {
     stage('Fix Docker Socket') {
      steps {
        sh 'chmod 666 /var/run/docker.sock || true'
      }
    }
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm install --include=dev' }
    }
    stage('Test') {
      steps {
        sh 'npm test -- --passWithNoTests --ci || true'
      }
    }
    stage('Build Image') {
      steps {
        sh "docker build -t ${IMAGE}:${TAG} ."
      }
    }
    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
          sh "docker push ${IMAGE}:${TAG}"
        }
      }
    }
    stage('Deploy to k8s') {
      steps {
        sh """
          kubectl set image deployment/edutrack-api \
            api=${IMAGE}:${TAG} \
            -n edutrack
          kubectl rollout status deployment/edutrack-api -n edutrack
        """
      }
    }
  }
  post {
    always { cleanWs() }
    success { echo 'Deployed successfully!' }
    failure { echo 'Build failed!' }
  }
}