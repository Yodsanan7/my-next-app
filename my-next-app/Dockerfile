# 1. ใช้ Node.js official image
FROM node:20-alpine AS builder

# 2. ตั้ง working directory
WORKDIR /app

# 3. คัดลอก package.json และ package-lock.json / yarn.lock
COPY package*.json ./
# COPY yarn.lock ./

# 4. ติดตั้ง dependencies
RUN npm install --legacy-peer-deps
# RUN yarn install --frozen-lockfile

# 5. คัดลอกโค้ดทั้งหมด
COPY . .

# 6. Build Next.js
RUN npm run build
# RUN yarn build

# 7. ใช้ image เล็กสำหรับ runtime
FROM node:20-alpine AS runner
WORKDIR /app

# 8. คัดลอกไฟล์ที่จำเป็นจาก builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 9. กำหนด environment variable
ENV NODE_ENV production
ENV PORT 3000

# 10. expose port
EXPOSE 3000

# 11. คำสั่ง run
CMD ["npm", "start"]