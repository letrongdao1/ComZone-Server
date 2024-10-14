// create-cart.dto.ts
export class CreateCartDto {
  userId: string;
  comicIds: string[]; // Array of comic IDs
  quantities: { [comicId: string]: number }; // Object mapping comic IDs to quantities
}

// update-cart.dto.ts
export class UpdateCartDto {
  comicIds?: string[];
  quantities?: { [comicId: string]: number };
}
