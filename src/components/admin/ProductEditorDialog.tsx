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
  const [draft, setDraft] = useState({
    name: "",
    price: 0,
    stock: "Disponible" as ProductStock,
    category: "",
    image: "",
  });
  
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (open) {
      if (initialProduct) {
        setDraft({
          name: initialProduct.name,
          price: initialProduct.price,
          stock: initialProduct.stock,
          category: initialProduct.category || categories[0] || "Streaming",
          image: initialProduct.image,
        });
      } else {
        setDraft({ name: "", price: 0, stock: "Disponible", category: categories[0] || "Streaming", image: "" });
      }
    }
  }, [open, initialProduct, categories]);

  const handleSaveProduct = () => {
    if (!draft.name.trim() || draft.price <= 0) return;

    const currentName = currentUser.providerName || currentUser.username || "Gusstore";
    const currentPhone = currentUser.phone || "51928862832";

    const ownerData = initialProduct ? {
      ownerId: initialProduct.ownerId,
      ownerUsername: initialProduct.ownerUsername,
      ownerName: initialProduct.ownerName || currentName,
      ownerPhone: initialProduct.ownerPhone || currentPhone,
      ownerLogo: initialProduct.ownerLogo,
    } : {
      ownerId: currentUser.id,
      ownerUsername: currentUser.username,
      ownerName: currentName,
      ownerPhone: currentPhone,
      ownerLogo: currentUser.logo,
    };

    onSave({
      id: initialProduct?.id ?? crypto.randomUUID(),
      name: draft.name.trim(),
      price: Number(draft.price),
      stock: draft.stock,
      category: draft.category,
      // Asegúrate de que productsStorage.ts ya tenga los 4 parámetros
      whatsappUrl: createWhatsAppUrl(draft.name.trim(), Number(draft.price), ownerData.ownerPhone, ownerData.ownerName),
      image: draft.image,
      ...ownerData,
    });
    onOpenChange(false);
  };

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(String(reader.result));
        setCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border/50">
          <DialogHeader><DialogTitle>{isEditing ? "Editar" : "Nuevo"} Producto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Nombre</Label>
            <Input value={draft.name} onChange={(e) => setDraft(p => ({...p, name: e.target.value}))} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio</Label>
                <Input type="number" value={draft.price || ""} onChange={(e) => setDraft(p => ({...p, price: Number(e.target.value)}))} />
              </div>
              <div>
                <Label>Stock</Label>
                <select value={draft.stock} onChange={(e) => setDraft(p => ({...p, stock: e.target.value as ProductStock}))} className="w-full h-10 rounded-md bg-background border px-3">
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </div>
            </div>
            <Label>Imagen</Label>
            <Input type="file" accept="image/*" onChange={handleUploadImage} />
            {draft.image && <img src={draft.image} className="h-32 w-full object-cover rounded-md" />}
            <Button onClick={handleSaveProduct} className="w-full bg-primary text-white font-bold">Guardar</Button>
            {isEditing && onDelete && <Button variant="outline" onClick={() => onDelete(initialProduct!.id)} className="w-full text-red-500">Eliminar</Button>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="bg-black border-none p-0 overflow-hidden">
          <div className="relative h-64 w-full">
            <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, ap) => setCroppedAreaPixels(ap)} />
          </div>
          <div className="p-4 bg-card">
            <Button onClick={async () => {
              if (cropImage && croppedAreaPixels) {
                const res = await getCroppedImage(cropImage, croppedAreaPixels);
                setDraft(p => ({...p, image: res}));
                setCropOpen(false);
              }
            }} className="w-full bg-primary text-white">Confirmar Recorte</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductEditorDialog;
