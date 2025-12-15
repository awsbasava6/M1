#!/bin/bash

echo "===== DevOps Tools Version Check ====="

check_cmd () {
  CMD=$1
  NAME=$2

  if command -v $CMD >/dev/null 2>&1; then
    echo -n "$NAME : "
    $CMD --version 2>/dev/null | head -n 1
  else
    echo "$NAME : NOT INSTALLED"
  fi
}

check_cmd git "Git"
check_cmd docker "Docker"
check_cmd docker-compose "Docker Compose"
echo -n "Java : "
java -version 2>&1 | head -n 1 || echo "Java : NOT INSTALLED"

check_cmd jenkins "Jenkins"
check_cmd aws "AWS CLI"
check_cmd terraform "Terraform"

echo -n "kubectl : "
kubectl version --client --short 2>/dev/null || echo "kubectl : NOT INSTALLED"

check_cmd helm "Helm"
check_cmd trivy "Trivy"
check_cmd sonar-scanner "Sonar Scanner"

echo "====================================="

