import { NextRequest, NextResponse } from 'next/server'
import os from 'os'

// Simple metrics for Prometheus
export async function GET(request: NextRequest) {
  const uptimeSeconds = process.uptime()
  const memoryUsage = process.memoryUsage()
  const cpuUsage = os.loadavg()
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  
  // Format metrics in Prometheus format
  const metrics = [
    `# HELP node_uptime_seconds The uptime of the Next.js server in seconds`,
    `# TYPE node_uptime_seconds gauge`,
    `node_uptime_seconds ${uptimeSeconds}`,
    
    `# HELP node_memory_heap_used_bytes Memory used in bytes`,
    `# TYPE node_memory_heap_used_bytes gauge`,
    `node_memory_heap_used_bytes ${memoryUsage.heapUsed}`,
    
    `# HELP node_memory_heap_total_bytes Total heap memory size in bytes`,
    `# TYPE node_memory_heap_total_bytes gauge`,
    `node_memory_heap_total_bytes ${memoryUsage.heapTotal}`,
    
    `# HELP node_memory_rss_bytes RSS memory usage in bytes`,
    `# TYPE node_memory_rss_bytes gauge`,
    `node_memory_rss_bytes ${memoryUsage.rss}`,
    
    `# HELP system_cpu_load_average System CPU load average (1min)`,
    `# TYPE system_cpu_load_average gauge`,
    `system_cpu_load_average ${cpuUsage[0]}`,
    
    `# HELP system_memory_total_bytes Total system memory in bytes`,
    `# TYPE system_memory_total_bytes gauge`,
    `system_memory_total_bytes ${totalMemory}`,
    
    `# HELP system_memory_free_bytes Free system memory in bytes`,
    `# TYPE system_memory_free_bytes gauge`,
    `system_memory_free_bytes ${freeMemory}`,
  ].join('\n')
  
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
} 