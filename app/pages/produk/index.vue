<template>
  <div>
    <!-- Toolbar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <!-- Full-Width Search Bar -->
      <div class="relative w-full">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          v-model="search"
          type="text"
          placeholder="Cari produk / barcode..."
          class="w-full pl-10 pr-32 sm:pr-36 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
        />
        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            v-if="search"
            @click="search = ''"
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
            title="Hapus"
          >
            <X class="w-4 h-4" />
          </button>
          <button
            @click="openScanner"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-md text-xs font-semibold transition-colors"
            title="Scan Barcode untuk Cari Produk (Fitur Beta)"
          >
            <Camera class="w-3.5 h-3.5" />
            <span>Scan</span>
            <span class="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-700 border border-amber-300 rounded font-bold">BETA</span>
          </button>
        </div>
      </div>

      <!-- Filters & Action Bar -->
      <div class="space-y-3">
        <!-- Filters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <select v-model="filterBisnis" class="w-full pl-3.5 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate">
            <option value="">Semua Bisnis</option>
            <option v-for="b in businessList" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <select v-model="filterKategori" class="w-full pl-3.5 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate">
            <option value="">Semua Kategori</option>
            <option value="NONE">Tanpa Kategori</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.name }} ({{ c.business?.name }})</option>
          </select>
          <select v-model="filterStatus" class="w-full pl-3.5 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate">
            <option value="">Semua Status</option>
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>

        <!-- Actions Row: Export/Import + Add Product + Scan Masal -->
        <div class="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <!-- Unified Single Button: Scan Barcode Masal -->
            <button
              @click="handleScanMasalClick"
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-3 h-9 text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
              :class="selectedProductIds.length > 0 ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-700 hover:to-indigo-700 animate-pulse' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'"
              title="Scan barcode masal untuk produk yang belum memiliki barcode"
            >
              <Layers class="w-3.5 h-3.5 shrink-0" :class="selectedProductIds.length > 0 ? 'text-white' : 'text-amber-600'" />
              <span>Scan Barcode Masal ({{ selectedProductIds.length > 0 ? selectedProductIds.length : unbarcodedCount }})</span>
            </button>

            <!-- Button Export CSV -->
            <button
              @click="exportCSV"
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-3 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              title="Ekspor produk ke file CSV"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 shrink-0" />
              <span>Ekspor CSV</span>
            </button>

            <!-- Button Export PDF -->
            <button
              @click="exportPDF"
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-3 h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              title="Ekspor produk ke dokumen PDF"
            >
              <FileText class="w-3.5 h-3.5 shrink-0" />
              <span>Ekspor PDF</span>
            </button>

            <!-- Button Import CSV -->
            <button
              @click="openImportModal"
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-3 h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              title="Impor produk dari file CSV"
            >
              <Upload class="w-3.5 h-3.5 shrink-0" />
              <span>Impor CSV</span>
            </button>
          </div>

          <NuxtLink to="/produk/tambah" class="inline-flex items-center justify-center gap-1.5 px-4 h-9 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-full sm:w-auto shrink-0">
            <Plus class="w-4 h-4" />
            <span>Tambah Produk</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Active Selection Banner / Bar -->
    <div
      v-if="selectedProductIds.length > 0"
      class="mb-4 bg-primary-900 text-white p-3 sm:px-4 rounded-xl border border-primary-700 shadow-md flex items-center justify-between flex-wrap gap-2 animate-fadeIn"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-7 h-7 rounded-full bg-primary-500/40 text-primary-200 flex items-center justify-center font-bold text-xs">
          {{ selectedProductIds.length }}
        </span>
        <span class="text-xs sm:text-sm font-semibold">Produk dipilih untuk pengisian barcode</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openBulkScanner"
          type="button"
          class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Layers class="w-3.5 h-3.5" />
          <span>Mulai Scan Masal</span>
        </button>

        <button
          @click="clearSelection"
          type="button"
          class="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
        >
          Batal Pilihan
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat produk...</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 select-none">
            <th class="w-10 px-3 py-3 text-center">
              <input
                type="checkbox"
                :checked="isAllPageSelected && paginatedData.length > 0"
                @change="toggleSelectAllPage"
                class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                title="Pilih Semua Halaman Ini"
              />
            </th>
            <th @click="toggleSort('name')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center gap-1.5">
                <span>Produk</span>
                <ArrowUp v-if="sortField === 'name' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'name' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th @click="toggleSort('business')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center gap-1.5">
                <span>Bisnis</span>
                <ArrowUp v-if="sortField === 'business' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'business' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th @click="toggleSort('category')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center gap-1.5">
                <span>Kategori</span>
                <ArrowUp v-if="sortField === 'category' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'category' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th @click="toggleSort('price')" class="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center justify-end gap-1.5">
                <span>Harga</span>
                <ArrowUp v-if="sortField === 'price' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'price' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th @click="toggleSort('stock')" class="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center justify-center gap-1.5">
                <span>Stok</span>
                <ArrowUp v-if="sortField === 'stock' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'stock' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th @click="toggleSort('status')" class="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
              <div class="flex items-center justify-center gap-1.5">
                <span>Status</span>
                <ArrowUp v-if="sortField === 'status' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowDown v-else-if="sortField === 'status' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />
              </div>
            </th>
            <th class="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="prod in paginatedData"
            :key="prod.id"
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-primary-50/40': selectedProductIds.includes(prod.id) }"
          >
            <td class="w-10 px-3 py-3.5 text-center">
              <input
                type="checkbox"
                :checked="selectedProductIds.includes(prod.id)"
                @change="toggleSelectProduct(prod.id)"
                class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
              />
            </td>
            <td class="py-3.5 px-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ prod.name }}</p>
                <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span v-if="prod.sku" class="text-[11px] font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-bold">SKU: {{ prod.sku }}</span>
                  <span v-if="prod.barcode" class="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">BC: {{ prod.barcode }}</span>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4 text-sm text-gray-600">
              {{ prod.business?.name || '-' }}
            </td>
            <td class="py-3.5 px-4 text-sm text-gray-600">
              <span v-if="prod.category" class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                {{ prod.category.name }}
              </span>
              <span v-else class="text-gray-400 italic text-xs">Tanpa Kategori</span>
            </td>
            <td class="py-3.5 px-4 text-sm text-gray-900 font-medium text-right">
              {{ fmt.format(prod.price) }}
            </td>
            <td class="py-3.5 px-4 text-center">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="prod.stock <= 5 ? 'bg-red-100 text-red-700' : prod.stock <= 20 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'"
              >
                {{ prod.stock }} {{ prod.unit || 'pcs' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-center">
              <span
                class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                :class="prod.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/produk/edit/${prod.id}`"
                  @click="editProduct(prod)"
                  class="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Edit"
                >
                  <Pencil class="w-4 h-4" />
                </NuxtLink>
                <button
                  @click="confirmDelete(prod)"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Hapus"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!paginatedData.length">
            <td colspan="8" class="py-8 text-center text-gray-500 text-sm">
              Tidak ada produk ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div v-if="!isLoading" class="sm:hidden space-y-3">
      <div
        v-for="prod in paginatedData"
        :key="prod.id"
        class="bg-white rounded-xl border border-gray-200 p-4 space-y-2 transition-colors"
        :class="{ 'bg-primary-50/40 border-primary-300': selectedProductIds.includes(prod.id) }"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-2.5 min-w-0">
            <input
              type="checkbox"
              :checked="selectedProductIds.includes(prod.id)"
              @change="toggleSelectProduct(prod.id)"
              class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer mt-0.5 shrink-0"
            />
            <div class="min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 truncate">{{ prod.name }}</h4>
              <p v-if="prod.barcode" class="text-xs text-blue-600 font-mono">BC: {{ prod.barcode }}</p>
            </div>
          </div>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="prod.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
          >
            {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>{{ prod.business?.name }} · {{ prod.category?.name || 'Tanpa Kategori' }}</span>
          <span
            class="font-semibold px-2 py-0.5 rounded-full"
            :class="prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
          >
            Stok: {{ prod.stock }} {{ prod.unit || 'pcs' }}
          </span>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-bold text-gray-900">{{ fmt.format(prod.price) }}</span>
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/produk/edit/${prod.id}`" @click="editProduct(prod)" class="p-1.5 text-gray-500 hover:text-primary-600">
              <Pencil class="w-4 h-4" />
            </NuxtLink>
            <button @click="confirmDelete(prod)" class="p-1.5 text-gray-500 hover:text-red-600">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="!paginatedData.length" class="text-center py-8 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
        Tidak ada produk ditemukan.
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 bg-white p-3 rounded-xl border border-gray-200">
      <p class="text-xs text-gray-500">
        Menampilkan {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredData.length) }} dari {{ filteredData.length }} produk
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="page--"
          :disabled="page === 1"
          class="px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50"
        >
          Prev
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="page = p"
          class="px-3 py-1 rounded-lg text-xs font-medium"
          :class="p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          {{ p }}
        </button>
        <button
          @click="page++"
          :disabled="page === totalPages"
          class="px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Hapus Produk</h3>
        <p class="text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{{ deleteTarget.name }}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="deleteTarget = null"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Batal
          </button>
          <button
            @click="doDelete"
            :disabled="isSaving"
            type="button"
            class="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
          >
            {{ isSaving ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import CSV Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <Upload class="w-5 h-5 text-blue-600" />
            <h3 class="text-base font-bold text-gray-900">Impor Produk dari CSV</h3>
          </div>
          <button @click="closeImportModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Instruction / Format Tip -->
        <div class="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 space-y-1.5">
          <p class="font-bold">Urutan Kolom File CSV (A - I):</p>
          <p class="font-mono text-[11px] bg-blue-100/80 p-2 rounded-lg text-blue-950">
            A: SKU | B: Barcode | C: Nama Produk | D: Bisnis | E: Kategori | F: Harga | G: Stok | H: Satuan | I: Status
          </p>
          <p>• Produk dengan <strong>SKU</strong>, <strong>Barcode</strong>, atau <strong>Nama Produk yang sama</strong> pada bisnis terkait akan <strong>dilewati (*skipped*) secara otomatis</strong>.</p>
        </div>

        <!-- Upload File Drop Area -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-gray-700">Pilih File CSV</label>
          <div class="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-blue-50/20 transition-all relative">
            <input
              type="file"
              accept=".csv,text/csv"
              @change="handleFileSelect"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet class="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p v-if="importFile" class="text-sm font-bold text-blue-600">{{ importFile.name }} ({{ (importFile.size / 1024).toFixed(1) }} KB)</p>
            <p v-else class="text-sm font-medium text-gray-600">Klik di sini atau tarik file <span class="font-bold text-blue-600">.csv</span> ke dalam kotak</p>
          </div>
        </div>

        <!-- Import Result Feedback -->
        <div v-if="importResult" class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          <h4 class="text-xs font-bold text-gray-900 uppercase tracking-wider">Hasil Import:</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-emerald-100/70 text-emerald-800 p-2.5 rounded-lg font-semibold flex items-center gap-1.5">
              <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{{ importResult.createdCount }} Produk Baru Ditambahkan</span>
            </div>
            <div class="bg-amber-100/70 text-amber-800 p-2.5 rounded-lg font-semibold flex items-center gap-1.5">
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>{{ importResult.skippedCount }} Produk Dilewati (Duplikat)</span>
            </div>
          </div>
          <div v-if="importResult.skippedDetails?.length" class="max-h-28 overflow-y-auto text-[11px] text-gray-500 space-y-1 pt-1 border-t border-gray-200">
            <p v-for="(item, idx) in importResult.skippedDetails" :key="idx" class="truncate">
              • <strong class="text-gray-700">{{ item.name }}</strong>: {{ item.reason }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="closeImportModal"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {{ importResult ? 'Tutup' : 'Batal' }}
          </button>
          <button
            v-if="!importResult"
            @click="processImport"
            :disabled="!importFile || isImporting"
            type="button"
            class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-40 transition-colors inline-flex items-center gap-2"
          >
            <Upload class="w-4 h-4" />
            {{ isImporting ? 'Mengimpor...' : 'Proses Import' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Camera Barcode Scanner Modal -->
    <BarcodeScannerModal
      :is-open="isScannerOpen"
      :auto-close-on-scan="true"
      @close="isScannerOpen = false"
      @scan="handleCameraScan"
    />

    <!-- Scan Barcode Masal Mode Choice Modal -->
    <div v-if="showScanModeChoiceModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-primary-50 rounded-xl text-primary-600">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">Scan Barcode Masal</h3>
              <p class="text-xs text-gray-500">Pilih metode pengisian barcode yang Anda inginkan</p>
            </div>
          </div>
          <button @click="showScanModeChoiceModal = false" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Options Container -->
        <div class="space-y-3">
          <!-- Option 1: Pilih Produk Terlebih Dahulu -->
          <button
            @click="handleChoiceManualSelect"
            type="button"
            class="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50/40 transition-all group relative flex items-start gap-3.5"
          >
            <div class="p-2.5 rounded-xl bg-gray-100 group-hover:bg-primary-500 group-hover:text-white text-gray-600 transition-colors shrink-0">
              <CheckSquare class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h4 class="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Pilih Produk Terlebih Dahulu
                </h4>
                <span class="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700 rounded-md">
                  Pilih Manual
                </span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Pilih produk yang ingin diberi barcode.
              </p>
            </div>
          </button>

          <!-- Option 2: Pilih Semua Produk -->
          <button
            @click="handleChoiceSelectAll"
            type="button"
            class="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group relative flex items-start gap-3.5"
          >
            <div class="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 transition-colors shrink-0">
              <Sparkles class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h4 class="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  Pilih Semua Produk ({{ activeBusinessName }})
                </h4>
                <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  Otomatis ({{ unbarcodedCount }})
                </span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">
                Otomatis pilih semua produk tanpa barcode.
              </p>
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end pt-2 border-t border-gray-100">
          <button
            @click="showScanModeChoiceModal = false"
            type="button"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Camera Barcode Scanner Modal -->
    <BulkBarcodeScannerModal
      :is-open="isBulkScannerOpen"
      :products="selectedProducts"
      @close="handleBulkScannerClose"
      @updated-product="handleBulkProductUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  Layers,
  Barcode,
  CheckSquare,
  Sparkles
} from 'lucide-vue-next'

const { fetchWithCache, invalidateCache } = useCachedFetch()
const { fetchWithAuth } = useApi()
const bizStore = useBusinessStore()
const fmt = useFormatCurrency()
const toast = useToastStore()
const { playSuccessBeep, unlockAudio } = useAudioBeep()

const isScannerOpen = ref(false)
const isBulkScannerOpen = ref(false)
const showScanModeChoiceModal = ref(false)
const selectedProductIds = ref<string[]>([])

const selectedProducts = computed(() => {
  return products.value.filter((p) => selectedProductIds.value.includes(p.id))
})

const unbarcodedCount = computed(() => {
  return filteredData.value.filter((p) => !p.barcode).length
})

const activeBusinessName = computed(() => {
  if (!filterBisnis.value) return 'Semua Bisnis'
  const found = businessList.value.find((b: any) => b.id === filterBisnis.value)
  return found?.name || 'Semua Bisnis'
})

const isAllPageSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every((p) => selectedProductIds.value.includes(p.id))
})

function toggleSelectProduct(id: string) {
  if (selectedProductIds.value.includes(id)) {
    selectedProductIds.value = selectedProductIds.value.filter((i) => i !== id)
  } else {
    selectedProductIds.value.push(id)
  }
}

function toggleSelectAllPage() {
  if (isAllPageSelected.value) {
    const pageIds = paginatedData.value.map((p) => p.id)
    selectedProductIds.value = selectedProductIds.value.filter((id) => !pageIds.includes(id))
  } else {
    const newIds = new Set([...selectedProductIds.value, ...paginatedData.value.map((p) => p.id)])
    selectedProductIds.value = Array.from(newIds)
  }
}

function handleScanMasalClick() {
  showScanModeChoiceModal.value = true
}

function handleChoiceManualSelect() {
  showScanModeChoiceModal.value = false
  if (selectedProductIds.value.length === 0) {
    toast.info('Silakan centang produk yang ingin diisi barcode pada tabel di bawah, lalu klik "Mulai Scan Masal"')
  } else {
    openBulkScanner()
  }
}

function handleChoiceSelectAll() {
  showScanModeChoiceModal.value = false
  const unbarcodedIds = filteredData.value.filter((p) => !p.barcode).map((p) => p.id)
  if (unbarcodedIds.length === 0) {
    toast.error('Semua produk pada filter saat ini sudah memiliki barcode')
    return
  }
  selectedProductIds.value = unbarcodedIds
  toast.success(`${unbarcodedIds.length} produk tanpa barcode berhasil dipilih`)
  openBulkScanner()
}

function selectUnbarcodedProducts() {
  const unbarcodedIds = filteredData.value.filter((p) => !p.barcode).map((p) => p.id)
  if (unbarcodedIds.length === 0) {
    toast.error('Semua produk pada filter saat ini sudah memiliki barcode')
    return
  }
  selectedProductIds.value = Array.from(new Set([...selectedProductIds.value, ...unbarcodedIds]))
  toast.success(`${unbarcodedIds.length} produk tanpa barcode berhasil dipilih`)
}

function clearSelection() {
  selectedProductIds.value = []
}

function openBulkScanner() {
  if (selectedProductIds.value.length === 0) {
    toast.error('Pilih setidaknya 1 produk terlebih dahulu')
    return
  }
  unlockAudio()
  isBulkScannerOpen.value = true
}

function handleBulkProductUpdated(productId: string, newBarcode: string) {
  const prod = products.value.find((p) => p.id === productId)
  if (prod) {
    prod.barcode = newBarcode
  }
}

async function handleBulkScannerClose() {
  isBulkScannerOpen.value = false
  invalidateCache('/products')
  await fetchProducts(true)
}

function openScanner() {
  unlockAudio()
  isScannerOpen.value = true
}

function handleCameraScan(scannedCode: string) {
  search.value = scannedCode
  playSuccessBeep()
  toast.success(`Cari barcode: ${scannedCode}`)
}

const editingProductState = useState<any>('editingProduct', () => null)

function editProduct(prod: any) {
  editingProductState.value = prod
}

const products = ref<any[]>([])
const categories = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)

const search = ref('')
const filterBisnis = ref('')
const filterKategori = ref('')
const filterStatus = ref<boolean | ''>('')

const sortField = ref<'name' | 'business' | 'category' | 'price' | 'stock' | 'status' | ''>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const page = ref(1)
const perPage = 10

const deleteTarget = ref<any>(null)

// Import CSV Modal State
const showImportModal = ref(false)
const importFile = ref<File | null>(null)
const isImporting = ref(false)
const importResult = ref<any>(null)

onMounted(async () => {
  if (bizStore.businesses.length === 0) {
    await bizStore.fetchAll()
  }
  if (bizStore.activeBusiness?.id) {
    filterBisnis.value = bizStore.activeBusiness.id
  }
  await Promise.all([fetchProducts(), fetchCategories()])
})

watch(
  () => bizStore.activeBusiness?.id,
  (newBizId) => {
    if (newBizId) {
      filterBisnis.value = newBizId
    }
  },
  { immediate: true }
)

async function fetchProducts(forceRefresh = false) {
  if (!products.value.length && !forceRefresh) isLoading.value = true
  try {
    const res = await fetchWithCache<any>('/products', {
      forceRefresh,
      onRevalidated: (fresh) => {
        if (fresh.success) products.value = fresh.data || []
      }
    })
    if (res.data?.success) {
      products.value = res.data.data || []
    }
  } catch (e) {
    toast.error('Gagal memuat daftar produk')
  } finally {
    isLoading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await fetchWithCache<any>('/categories', {
      onRevalidated: (fresh) => {
        if (fresh.success) categories.value = fresh.data || []
      }
    })
    if (res.data?.success) {
      categories.value = res.data.data || []
    }
  } catch (e) {}
}

const businessList = computed(() => bizStore.businesses)

const filteredCategories = computed(() => {
  if (!filterBisnis.value) return categories.value
  return categories.value.filter((c) => c.businessId === filterBisnis.value)
})

function toggleSort(field: 'name' | 'business' | 'category' | 'price' | 'stock' | 'status') {
  if (sortField.value === field) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortField.value = ''
      sortDirection.value = 'asc'
    }
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  page.value = 1
}

const filteredData = computed(() => {
  let data = [...products.value]
  if (filterBisnis.value) data = data.filter((p) => p.businessId === filterBisnis.value)
  if (filterKategori.value === 'NONE') {
    data = data.filter((p) => !p.categoryId)
  } else if (filterKategori.value) {
    data = data.filter((p) => p.categoryId === filterKategori.value)
  }
  if (filterStatus.value !== '') data = data.filter((p) => p.isActive === filterStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    )
  }

  if (sortField.value) {
    data.sort((a, b) => {
      let valA: any
      let valB: any

      switch (sortField.value) {
        case 'name':
          valA = a.name || ''
          valB = b.name || ''
          break
        case 'business':
          valA = a.business?.name || ''
          valB = b.business?.name || ''
          break
        case 'category':
          valA = a.category?.name || 'Tanpa Kategori'
          valB = b.category?.name || 'Tanpa Kategori'
          break
        case 'price':
          valA = a.price || 0
          valB = b.price || 0
          break
        case 'stock':
          valA = a.stock || 0
          valB = b.stock || 0
          break
        case 'status':
          valA = a.isActive ? 1 : 0
          valB = b.isActive ? 1 : 0
          break
      }

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB, 'id', { sensitivity: 'base', numeric: true })
        return sortDirection.value === 'asc' ? comp : -comp
      } else {
        return sortDirection.value === 'asc' ? valA - valB : valB - valA
      }
    })
  }

  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage))
const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredData.value.slice(start, start + perPage)
})
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

watch([search, filterKategori, filterStatus], () => { page.value = 1 })
watch(filterBisnis, () => {
  filterKategori.value = ''
  selectedProductIds.value = []
  page.value = 1
})

function confirmDelete(prod: any) {
  deleteTarget.value = prod
}

async function doDelete() {
  if (!deleteTarget.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth<any>(`/products/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      toast.success('Produk berhasil dihapus')
      invalidateCache('/products')
      await fetchProducts(true)
    } else {
      toast.error(res.message || 'Gagal menghapus produk')
    }
    deleteTarget.value = null
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus produk')
  } finally {
    isSaving.value = false
  }
}

// Export to CSV Function
function exportCSV() {
  const dataToExport = filteredData.value
  if (dataToExport.length === 0) {
    toast.error('Tidak ada data produk untuk diekspor')
    return
  }

  const headers = ['SKU', 'Barcode', 'Nama Produk', 'Bisnis', 'Kategori', 'Harga', 'Stok', 'Satuan', 'Status']
  const rows = dataToExport.map(p => [
    `"${(p.sku || '').replace(/"/g, '""')}"`,
    `"${(p.barcode || '').replace(/"/g, '""')}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.business?.name || '').replace(/"/g, '""')}"`,
    `"${(p.category?.name || 'Tanpa Kategori').replace(/"/g, '""')}"`,
    p.price || 0,
    p.stock || 0,
    `"${(p.unit || 'pcs').replace(/"/g, '""')}"`,
    p.isActive ? 'Aktif' : 'Nonaktif'
  ])

  // sep=; directive ensures Excel on Windows splits columns A to I automatically
  const csvContent = '\uFEFFsep=;\n' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  link.setAttribute('href', url)
  link.setAttribute('download', `Daftar_Produk_${dateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success(`${dataToExport.length} produk berhasil diekspor ke CSV`)
}

// Export to PDF Function
async function exportPDF() {
  const dataToExport = filteredData.value
  if (dataToExport.length === 0) {
    toast.error('Tidak ada data produk untuk diekspor')
    return
  }

  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  
  // Title Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN DAFTAR PRODUK', 14, 18)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tanggal Cetak: ${dateStr} | Total: ${dataToExport.length} Produk`, 14, 25)

  const tableHeaders = [['No', 'SKU', 'Barcode', 'Nama Produk', 'Bisnis', 'Kategori', 'Harga', 'Stok', 'Status']]
  const tableData = dataToExport.map((p, index) => [
    index + 1,
    p.sku || '-',
    p.barcode || '-',
    p.name,
    p.business?.name || '-',
    p.category?.name || 'Tanpa Kategori',
    fmt.format(p.price || 0),
    `${p.stock || 0} ${p.unit || 'pcs'}`,
    p.isActive ? 'Aktif' : 'Nonaktif'
  ])

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      4: { halign: 'left' },
      5: { halign: 'right' },
      6: { halign: 'center' },
      7: { halign: 'center' }
    }
  })

  const fileDateStr = new Date().toISOString().split('T')[0]
  doc.save(`Daftar_Produk_${fileDateStr}.pdf`)
  toast.success(`${dataToExport.length} produk berhasil diekspor ke PDF`)
}

// Import CSV Modal Handler Functions
function openImportModal() {
  importFile.value = null
  importResult.value = null
  showImportModal.value = true
}

function closeImportModal() {
  showImportModal.value = false
  importFile.value = null
  importResult.value = null
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    importFile.value = input.files[0]
  }
}

function parseCSV(csvText: string) {
  let lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0)
  if (lines.length === 0) return []

  // Ignore Excel 'sep=...' directive header line if present
  if (lines[0].toLowerCase().startsWith('sep=')) {
    lines = lines.slice(1)
  }

  if (lines.length === 0) return []

  // Auto-detect delimiter (prefer semicolon if found, else comma or tab)
  const sampleLine = lines[0]
  let delimiter = ','
  const semiCount = (sampleLine.match(/;/g) || []).length
  const commaCount = (sampleLine.match(/,/g) || []).length
  if (semiCount >= commaCount && semiCount > 0) {
    delimiter = ';'
  } else if (sampleLine.includes('\t')) {
    delimiter = '\t'
  }

  const splitRow = (rowStr: string) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
    return result
  }

  const firstRow = splitRow(lines[0])
  const firstRowLower = firstRow.map(h => h.toLowerCase().trim())
  
  // Check if first row is header
  const isHeader = firstRowLower.some(h => 
    h.includes('sku') || h.includes('barcode') || h.includes('nama') || h.includes('produk') || h.includes('harga') || h.includes('stok')
  )

  // Explicit Column Order (A: SKU, B: Barcode, C: Nama Produk, D: Bisnis, E: Kategori, F: Harga, G: Stok, H: Satuan, I: Status)
  let skuIdx = isHeader ? firstRowLower.findIndex(h => h === 'sku') : 0
  let barcodeIdx = isHeader ? firstRowLower.findIndex(h => h.includes('barcode')) : 1
  let nameIdx = isHeader ? firstRowLower.findIndex(h => h.includes('nama') || h.includes('name') || h.includes('produk')) : 2
  let bizIdx = isHeader ? firstRowLower.findIndex(h => h.includes('bisnis') || h.includes('business')) : 3
  let catIdx = isHeader ? firstRowLower.findIndex(h => h.includes('kategori') || h.includes('category')) : 4
  let priceIdx = isHeader ? firstRowLower.findIndex(h => h.includes('harga') || h.includes('price')) : 5
  let stockIdx = isHeader ? firstRowLower.findIndex(h => h.includes('stok') || h.includes('stock')) : 6
  let unitIdx = isHeader ? firstRowLower.findIndex(h => h.includes('satuan') || h.includes('unit')) : 7
  let statusIdx = isHeader ? firstRowLower.findIndex(h => h.includes('status')) : 8

  if (skuIdx === -1) skuIdx = 0
  if (barcodeIdx === -1) barcodeIdx = 1
  if (nameIdx === -1) nameIdx = 2
  if (bizIdx === -1) bizIdx = 3
  if (catIdx === -1) catIdx = 4
  if (priceIdx === -1) priceIdx = 5
  if (stockIdx === -1) stockIdx = 6
  if (unitIdx === -1) unitIdx = 7
  if (statusIdx === -1) statusIdx = 8

  const parsedProducts: any[] = []
  const startRowIndex = isHeader ? 1 : 0

  for (let i = startRowIndex; i < lines.length; i++) {
    const row = splitRow(lines[i])
    if (row.length === 0 || !row.some(cell => cell.length > 0)) continue

    const nameVal = row[nameIdx] || row[2] || row[1] || row[0]
    if (!nameVal) continue

    const priceVal = row[priceIdx] !== undefined ? row[priceIdx] : ''
    const stockVal = row[stockIdx] !== undefined ? row[stockIdx] : ''
    const statusVal = row[statusIdx] !== undefined ? row[statusIdx] : ''

    parsedProducts.push({
      sku: row[skuIdx] || '',
      barcode: row[barcodeIdx] || '',
      name: nameVal,
      businessName: row[bizIdx] || '',
      categoryName: row[catIdx] || '',
      price: parseInt(String(priceVal).replace(/[^0-9]/g, '')) || 0,
      stock: parseInt(String(stockVal).replace(/[^0-9]/g, '')) || 0,
      unit: row[unitIdx] || 'pcs',
      isActive: statusVal ? !String(statusVal).toLowerCase().includes('non') && !String(statusVal).toLowerCase().includes('false') : true
    })
  }

  return parsedProducts
}

async function processImport() {
  if (!importFile.value) {
    toast.error('Pilih file CSV terlebih dahulu')
    return
  }

  isImporting.value = true
  try {
    const text = await importFile.value.text()
    const parsedProducts = parseCSV(text)

    if (parsedProducts.length === 0) {
      toast.error('Tidak ada data produk yang dapat dibaca dari file CSV')
      isImporting.value = false
      return
    }

    const activeBizId = filterBisnis.value || bizStore.activeBusinessId

    const res = await fetchWithAuth<any>('/products/import', {
      method: 'POST',
      body: {
        products: parsedProducts,
        defaultBusinessId: activeBizId
      }
    })

    if (res.success) {
      importResult.value = res.data
      toast.success(`Import selesai: ${res.data.createdCount} produk baru ditambahkan, ${res.data.skippedCount} dilewati.`)
      invalidateCache('/products')
      await fetchProducts(true)
    } else {
      toast.error(res.message || 'Gagal mengimpor produk')
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal mengolah file CSV')
  } finally {
    isImporting.value = false
  }
}
</script>
