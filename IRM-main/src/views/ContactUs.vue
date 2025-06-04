<template>
  <div class="contact-us-page">
    <div class="contact-header">
      <h2>Contact Us</h2>
      <p>If you have any questions or need assistance, feel free to reach out to us:</p>
    </div>
    <ul class="contact-info">
      <li><strong>Email:</strong> support@iis.co.nz</li>
      <li><strong>Phone:</strong> +64 7 123 4567</li>
      <li><strong>Address:</strong> Wintec, Hamilton, New Zealand</li>
    </ul>
  </div>
</template>

<script setup>
</script>

<style scoped>
.contact-us-page {
  padding: 40px 60px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: white;
  color: #1E5192;
}

.contact-header {
  margin-bottom: 25px;
}

.contact-header h2 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.contact-header p {
  font-size: 18px;
}

.contact-info {
  list-style: none;
  padding-left: 0;
}

.contact-info li {
  font-size: 18px;
  margin-bottom: 10px;
}
</style>
