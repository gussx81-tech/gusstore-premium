import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCroppedImage } from "@/lib/cropImage";
import { createWhatsAppUrl, loadCategories } from "@/lib/productsStorage";
import type { Product, ProductStock } from "@/types/product";
import type { AppUser } from "@/types/user";

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onDelete?: (id: string) => void;
  categories: string[];
  currentUser: AppUser;
}

interface ProductDraft {
  name: string;
  price: number;
  stock: ProductStock;
  category: string;
  image: string;
}

const ProductEditorDialog = ({
  open,
  onOpenChange,
  initialProduct,
  onSave,
  onDelete,
  categories,
  currentUser,
}: ProductEditorDialogProps) => {
  const isEditing = Boolean(initialProduct);
  const [draft, setDraft] = useState<ProductDraft>({
    name: "",
    price: 0,
    stock: "Disponible",
    category: categories[0] || "Streaming",
    image: "",
  });
  
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Efecto para cargar los datos cuando se abre el modal
  useEffect(() => {
    if (!open) return;

    if (initialProduct) {
      setDraft({
        name: initialProduct.name,
        price: initialProduct.price,
        stock: initialProduct.stock,
        category: initialProduct.category || categories[0] || "Streaming",
        image: initialProduct.image,
      });
    } else {
      setDraft({ 
        name: "", 
        price: 0, 
        stock: "Disponible", 
        category: categories[0] || "Streaming", 
        image: "" 
      });
    }
  }, [open, initialProduct, categories]);

  const categoryOptions = useMemo(() => {
    return categories.length > 0 ? categories : loadCategories();
  }, [categories]);

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(String(reader.result));
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImage(cropImage, croppedAreaPixels);
      setDraft((prev) => ({ ...prev, image: cropped }));
      setCropOpen(false);
    } catch (e) {
      console.error("Error al recortar la imagen:", e);
    }
  };

  const handleSaveProduct = () => {
    if (!draft.name.trim() || draft.price <= 0) return;

    // 1. Obtenemos el nombre del proveedor actual (Socio o Admin)
    const currentProviderName = currentUser.providerName || currentUser.username || "Gusstore";

    // 2. Preparamos los datos del dueño
    const ownerData = initialProduct
      ? {
          ownerId: initialProduct.ownerId,
          ownerUsername: initialProduct.ownerUsername,
          ownerName: initialProduct.ownerName || currentProviderName,
          ownerPhone: initialProduct.ownerPhone,
          ownerLogo: initialProduct.ownerLogo,
        }
      : {
          ownerId: currentUser.id,
          ownerUsername: currentUser.username,
          ownerName: currentProviderName,
          ownerPhone: currentUser.phone,
          ownerLogo: currentUser.logo,
        };

    // 3. Ejecutamos el guardado con el link de WhatsApp corregido
    onSave({
      id: initialProduct?.id ?? crypto.randomUUID(),
      name: draft.name.trim(),
      price: Number(draft.price),
      stock: draft.stock,
      category: draft.category,
      // PASAMOS 4 PARÁMETROS: nombre, precio, celular y nombre del dueño
      whatsappUrl: createWhatsAppUrl(draft.name.trim(), Number(draft.price), ownerData.ownerPhone, ownerData.ownerName),
      image: draft.image,
      ...ownerData,
    });

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nombre del Servicio</Label>
              <Input 
                value={draft.name} 
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} 
                placeholder="Ej: Netflix 1 Perfil"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Precio (S/)</Label>
                <Input 
                  type="number" 
                  value={draft.price || ""} 
                  onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))} 
                />
              </div>
              <div>
                <Label>Stock</Label>
                <select
                  value={draft.stock}
                  onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value as ProductStock }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Disponible">Disponible ✅</option>
                  <option value="Agotado">Agotado ❌</option>
                </select>
              </div>
              <div>
                <Label>Categoría</Label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Imagen</Label>
              <Input type="file" accept="image/*" onChange={handleUploadImage} className="cursor-pointer" />
              {draft.image && (
                <div className="mt-2 relative group">
                  <img 
                    src={draft.image} 
                    className="h-32 w-full rounded-lg object-cover border border-border" 
                    alt="Preview" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">Imagen seleccionada</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={handleSaveProduct} 
                className="w-full bg-gradient-brand text-primary-foreground font-bold shadow-lg hover:brightness-110 transition-all"
              >
                {isEditing ? "Guardar cambios" : "Publicar ahora"}
              </Button>
              
              {isEditing && onDelete && initialProduct && (
                <Button 
                  variant="outline" 
                  onClick={() => onDelete(initialProduct.id)} 
                  className="w-full font-bold text-destructive border-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  BORRAR ESTA TARJETA
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE RECORTE (CROPPER) */}
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-black border-none">
          <div className="relative h-80 w-full">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, ap) => setCroppedAreaPixels(ap)}
            />
          </div>
          <div className="p-4 bg-card space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min={1} max={3} step={0.1} 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))} 
                className="w-full accent-primary"
              />
            </div>
            <Button onClick={handleCropSave} className="w-full bg-primary text-primary-foreground font-bold">
              Aplicar recorte
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductEditorDialog;
