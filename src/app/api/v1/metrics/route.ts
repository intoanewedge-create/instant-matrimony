import { prisma } from "@/lib/prisma";
import { cacheProvider } from "@/lib/container";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const registrations = await prisma.user.count();
    const activeSessions = await prisma.userSessionHistory.count({
      where: { logoutAt: null, revokedAt: null },
    });
    const otpRequests = await prisma.verificationOtp.count();
    const messagesSent = await prisma.message.count();
    const paymentSuccess = await prisma.payment.count({ where: { status: "PAID" } });
    const paymentFailure = await prisma.payment.count({ where: { status: "FAILED" } });

    const cacheMetrics = cacheProvider.getMetrics();
    const totalCacheRequests = cacheMetrics.hits + cacheMetrics.misses;
    const cacheHitRatio = totalCacheRequests > 0 ? (cacheMetrics.hits / totalCacheRequests) : 1.0;

    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();

    const lines = [
      `# HELP node_memory_heap_used_bytes Memory heap used in bytes`,
      `# TYPE node_memory_heap_used_bytes gauge`,
      `node_memory_heap_used_bytes ${mem.heapUsed}`,
      
      `# HELP node_memory_heap_total_bytes Memory heap total in bytes`,
      `# TYPE node_memory_heap_total_bytes gauge`,
      `node_memory_heap_total_bytes ${mem.heapTotal}`,

      `# HELP node_memory_rss_bytes Memory RSS in bytes`,
      `# TYPE node_memory_rss_bytes gauge`,
      `node_memory_rss_bytes ${mem.rss}`,

      `# HELP node_cpu_usage_user_microseconds CPU user usage in microseconds`,
      `# TYPE node_cpu_usage_user_microseconds counter`,
      `node_cpu_usage_user_microseconds ${cpu.user}`,

      `# HELP node_cpu_usage_system_microseconds CPU system usage in microseconds`,
      `# TYPE node_cpu_usage_system_microseconds counter`,
      `node_cpu_usage_system_microseconds ${cpu.system}`,

      `# HELP app_active_sessions_count Total active sessions count`,
      `# TYPE app_active_sessions_count gauge`,
      `app_active_sessions_count ${activeSessions}`,

      `# HELP app_registrations_total Total registered users count`,
      `# TYPE app_registrations_total counter`,
      `app_registrations_total ${registrations}`,

      `# HELP app_otp_requests_total Total OTP verification requests`,
      `# TYPE app_otp_requests_total counter`,
      `app_otp_requests_total ${otpRequests}`,

      `# HELP app_messages_sent_total Total chat messages sent`,
      `# TYPE app_messages_sent_total counter`,
      `app_messages_sent_total ${messagesSent}`,

      `# HELP app_payment_success_total Total successful payments`,
      `# TYPE app_payment_success_total counter`,
      `app_payment_success_total ${paymentSuccess}`,

      `# HELP app_payment_failure_total Total failed payments`,
      `# TYPE app_payment_failure_total counter`,
      `app_payment_failure_total ${paymentFailure}`,

      `# HELP app_cache_hit_ratio Cache hit ratio`,
      `# TYPE app_cache_hit_ratio gauge`,
      `app_cache_hit_ratio ${cacheHitRatio}`,

      `# HELP app_cache_hits_total Cache hit count`,
      `# TYPE app_cache_hits_total counter`,
      `app_cache_hits_total ${cacheMetrics.hits}`,

      `# HELP app_cache_misses_total Cache miss count`,
      `# TYPE app_cache_misses_total counter`,
      `app_cache_misses_total ${cacheMetrics.misses}`,
    ];

    const body = lines.join("\n") + "\n";
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    });
  } catch (error: any) {
    return new Response(`Error gathering metrics: ${error.message}\n`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
