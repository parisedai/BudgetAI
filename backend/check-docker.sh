#!/bin/bash
echo "=== Docker Build Progress Checker ==="
echo ""
echo "📦 Checking containers..."
docker-compose ps
echo ""
echo "📊 Recent logs (last 15 lines):"
docker-compose logs --tail=15 2>/dev/null || echo "No logs yet - build may still be in progress"
echo ""
echo "🖼️  Docker images:"
docker images | grep -E "REPOSITORY|budgetai" | head -3
echo ""
echo "💡 To see live progress, run: docker-compose logs -f"

