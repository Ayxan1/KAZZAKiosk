import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/sales_provider.dart';
import '../../utils/theme.dart';
import '../../models/product.dart';
import 'package:intl/intl.dart';

class SellerHomeScreen extends StatefulWidget {
  const SellerHomeScreen({super.key});

  @override
  State<SellerHomeScreen> createState() => _SellerHomeScreenState();
}

class _SellerHomeScreenState extends State<SellerHomeScreen> {
  int _selectedIndex = 0;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final authProvider = context.read<AuthProvider>();
    final kioskId = authProvider.user!.assignedKioskId!;
    context.read<ProductProvider>().loadProducts(kioskId);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    final pages = [
      _SalesPage(),
      _InventoryPage(),
      _HistoryPage(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('KAZZAKIOSK'),
            Text(
              authProvider.user?.fullName ?? '',
              style: AppTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.point_of_sale),
            label: 'Satış',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory),
            label: 'Anbar',
          ),
          NavigationDestination(
            icon: Icon(Icons.history),
            label: 'Tarixçə',
          ),
        ],
      ),
    );
  }
}

class _SalesPage extends StatefulWidget {
  @override
  State<_SalesPage> createState() => _SalesPageState();
}

class _SalesPageState extends State<_SalesPage> {
  final _searchController = TextEditingController();
  String _paymentMethod = 'CASH';

  void _addProductToCart(KioskProduct product) {
    if (product.stockQuantity <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Məhsul stokda yoxdur')),
      );
      return;
    }

    context.read<SalesProvider>().addToCart(product, 1);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product.product.name} səbətə əlavə edildi')),
    );
  }

  Future<void> _completeSale() async {
    final salesProvider = context.read<SalesProvider>();
    final authProvider = context.read<AuthProvider>();

    if (salesProvider.cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Səbət boşdur')),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Satışı tamamla'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Məbləğ: ${salesProvider.cartTotal.toStringAsFixed(2)} AZN'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _paymentMethod,
              decoration: const InputDecoration(labelText: 'Ödəniş üsulu'),
              items: const [
                DropdownMenuItem(value: 'CASH', child: Text('Nağd')),
                DropdownMenuItem(value: 'CARD', child: Text('Kart')),
              ],
              onChanged: (value) {
                setState(() {
                  _paymentMethod = value!;
                });
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Ləğv et'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Təsdiq et'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await salesProvider.completeSale(
        authProvider.user!.assignedKioskId!,
        _paymentMethod,
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Satış uğurla tamamlandı')),
        );
        context.read<ProductProvider>().loadProducts(
              authProvider.user!.assignedKioskId!,
            );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(salesProvider.error ?? 'Xəta baş verdi'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final salesProvider = context.watch<SalesProvider>();

    return Row(
      children: [
        // Products list
        Expanded(
          flex: 2,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    labelText: 'Məhsul axtar (Ad, Kod, Barcode)',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (value) {
                    final authProvider = context.read<AuthProvider>();
                    context.read<ProductProvider>().loadProducts(
                          authProvider.user!.assignedKioskId!,
                          search: value,
                        );
                  },
                ),
              ),
              Expanded(
                child: productProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        itemCount: productProvider.products.length,
                        itemBuilder: (context, index) {
                          final product = productProvider.products[index];
                          return ListTile(
                            title: Text(product.product.name),
                            subtitle: Text(
                              'Qiymət: ${product.price.toStringAsFixed(2)} AZN | Stok: ${product.stockQuantity}',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.add_shopping_cart),
                              onPressed: () => _addProductToCart(product),
                            ),
                            onTap: () => _addProductToCart(product),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),

        // Cart
        Expanded(
          child: Container(
            color: Colors.grey.shade50,
            child: Column(
              children: [
                AppBar(
                  title: Text('Səbət (${salesProvider.cartCount})'),
                  automaticallyImplyLeading: false,
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: salesProvider.cartItems.length,
                    itemBuilder: (context, index) {
                      final item = salesProvider.cartItems[index];
                      return ListTile(
                        title: Text(item.product?.name ?? ''),
                        subtitle: Text(
                            '${item.unitPrice.toStringAsFixed(2)} AZN x ${item.quantity}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove),
                              onPressed: () {
                                salesProvider.updateQuantity(
                                    index, item.quantity - 1);
                              },
                            ),
                            Text('${item.quantity}'),
                            IconButton(
                              icon: const Icon(Icons.add),
                              onPressed: () {
                                salesProvider.updateQuantity(
                                    index, item.quantity + 1);
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete),
                              onPressed: () =>
                                  salesProvider.removeFromCart(index),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.shade300,
                        blurRadius: 4,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Cəmi:', style: AppTheme.heading3),
                          Text(
                            '${salesProvider.cartTotal.toStringAsFixed(2)} AZN',
                            style: AppTheme.heading2.copyWith(
                              color: AppTheme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _completeSale,
                          icon: const Icon(Icons.check),
                          label: const Text('Satışı tamamla'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _InventoryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text('Anbar', style: AppTheme.heading2),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () => _showAddProductDialog(context),
                icon: const Icon(Icons.add),
                label: const Text('Məhsul əlavə et'),
              ),
            ],
          ),
        ),
        Expanded(
          child: productProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: productProvider.products.length,
                  itemBuilder: (context, index) {
                    final product = productProvider.products[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: ListTile(
                        title: Text(product.product.name),
                        subtitle: Text(
                          'Kod: ${product.product.productCode ?? '-'} | Barcode: ${product.product.barcode ?? '-'}',
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '${product.price.toStringAsFixed(2)} AZN',
                              style: AppTheme.bodyLarge.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Stok: ${product.stockQuantity}',
                              style: AppTheme.bodySmall.copyWith(
                                color: product.isLowStock
                                    ? AppTheme.errorColor
                                    : AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  void _showAddProductDialog(BuildContext context) {
    final nameController = TextEditingController();
    final codeController = TextEditingController();
    final barcodeController = TextEditingController();
    final priceController = TextEditingController();
    final stockController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Məhsul əlavə et'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Məhsul adı *'),
              ),
              TextField(
                controller: codeController,
                decoration: const InputDecoration(labelText: 'Məhsul kodu'),
              ),
              TextField(
                controller: barcodeController,
                decoration: const InputDecoration(labelText: 'Barcode'),
              ),
              TextField(
                controller: priceController,
                decoration: const InputDecoration(labelText: 'Qiymət (AZN) *'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: stockController,
                decoration: const InputDecoration(labelText: 'Stok miqdarı *'),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Ləğv et'),
          ),
          ElevatedButton(
            onPressed: () async {
              final authProvider = context.read<AuthProvider>();
              final success = await context.read<ProductProvider>().addProduct(
                    authProvider.user!.assignedKioskId!,
                    name: nameController.text,
                    productCode: codeController.text.isEmpty
                        ? null
                        : codeController.text,
                    barcode: barcodeController.text.isEmpty
                        ? null
                        : barcodeController.text,
                    price: double.parse(priceController.text),
                    stockQuantity: int.parse(stockController.text),
                  );

              if (context.mounted) {
                Navigator.pop(context);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Məhsul əlavə edildi')),
                  );
                }
              }
            },
            child: const Text('Əlavə et'),
          ),
        ],
      ),
    );
  }
}

class _HistoryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final salesProvider = context.watch<SalesProvider>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text('Satış Tarixçəsi', style: AppTheme.heading2),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () {
                  final authProvider = context.read<AuthProvider>();
                  context.read<SalesProvider>().loadSales(
                        authProvider.user!.assignedKioskId!,
                      );
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Yenilə'),
              ),
            ],
          ),
        ),
        Expanded(
          child: salesProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: salesProvider.sales.length,
                  itemBuilder: (context, index) {
                    final sale = salesProvider.sales[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: ExpansionTile(
                        title: Text(
                          '${sale.totalAmount.toStringAsFixed(2)} AZN',
                          style: AppTheme.bodyLarge.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        subtitle: Text(
                          DateFormat('dd.MM.yyyy HH:mm').format(sale.saleDate),
                        ),
                        trailing: Chip(
                          label: Text(
                              sale.paymentMethod == 'CASH' ? 'Nağd' : 'Kart'),
                        ),
                        children: sale.items.map((item) {
                          return ListTile(
                            title: Text(item.product?.name ?? ''),
                            subtitle: Text(
                                '${item.quantity} x ${item.unitPrice.toStringAsFixed(2)} AZN'),
                            trailing:
                                Text('${item.subtotal.toStringAsFixed(2)} AZN'),
                          );
                        }).toList(),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
