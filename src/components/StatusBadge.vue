<template>
  <span class="status-badge">
    <span class="pulse"></span> Ao vivo
  </span>
</template>

<style scoped>
.status-badge {
  background: #22c55e20;
  color: #22c55e;
  padding: 6px 14px;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #22c55e40;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  display: inline-block;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
</style>